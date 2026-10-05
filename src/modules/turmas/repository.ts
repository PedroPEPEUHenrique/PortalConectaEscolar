import "@/lib/apenas-servidor";
import { db } from "@/lib/db";
import { ErroConflito, ErroNaoEncontrado, mapearErroBanco } from "@/lib/errors";
import type {
  AtualizarTurma,
  CriarTurma,
  MembroTurma,
  Turma,
  TurmaBase,
} from "./schema";

const COLUNAS = "id, nome, descricao, ano_letivo, created_at";

const COLUNAS_COM_VINCULOS = `
  ${COLUNAS},
  turma_alunos(aluno_id),
  turma_professores(professor_id, perfis(id, email, nome_completo))
`;

function normalizarPerfil(valor: unknown): MembroTurma | null {
  const perfil = Array.isArray(valor) ? valor[0] : valor;
  if (!perfil || typeof perfil !== "object") return null;

  const campos = perfil as Record<string, unknown>;
  if (typeof campos.id !== "string") return null;

  return {
    id: campos.id,
    email: typeof campos.email === "string" ? campos.email : null,
    nome_completo: typeof campos.nome_completo === "string" ? campos.nome_completo : null,
  };
}

export async function listarComVinculos(): Promise<Turma[]> {
  const { data, error } = await db()
    .from("turmas")
    .select(COLUNAS_COM_VINCULOS)
    .order("ano_letivo", { ascending: false })
    .order("nome", { ascending: true });

  if (error) throw mapearErroBanco(error, "Falha ao buscar turmas");

  return (data ?? []).map((linha) => {
    const turma = linha as unknown as Turma;
    return {
      ...turma,
      turma_alunos: turma.turma_alunos ?? [],
      turma_professores: (turma.turma_professores ?? []).map((vinculo) => ({
        professor_id: vinculo.professor_id,
        perfis: normalizarPerfil(vinculo.perfis),
      })),
    };
  });
}

export async function inserir(dados: CriarTurma): Promise<TurmaBase> {
  const { data, error } = await db().from("turmas").insert([dados]).select(COLUNAS).single();

  if (error) throw mapearErroBanco(error, "Falha ao criar turma");
  return data as TurmaBase;
}

export async function atualizar(id: string, dados: AtualizarTurma): Promise<TurmaBase> {
  const { data, error } = await db().from("turmas").update(dados).eq("id", id).select(COLUNAS);

  if (error) throw mapearErroBanco(error, "Falha ao atualizar turma");
  if (!data?.length) throw new ErroNaoEncontrado("Turma não encontrada");
  return data[0] as TurmaBase;
}

export async function remover(id: string): Promise<void> {
  const { data, error } = await db().from("turmas").delete().eq("id", id).select("id");

  if (error) throw mapearErroBanco(error, "Falha ao excluir turma");
  if (!data?.length) throw new ErroNaoEncontrado("Turma não encontrada");
}

export async function listarProfessores(turmaId: string): Promise<MembroTurma[]> {
  const { data, error } = await db()
    .from("turma_professores")
    .select("perfis(id, email, nome_completo)")
    .eq("turma_id", turmaId);

  if (error) throw mapearErroBanco(error, "Falha ao buscar professores da turma");

  return (data ?? [])
    .map((linha) => normalizarPerfil((linha as Record<string, unknown>).perfis))
    .filter((perfil): perfil is MembroTurma => perfil !== null);
}

export async function listarAlunos(turmaId: string): Promise<MembroTurma[]> {
  const { data, error } = await db()
    .from("turma_alunos")
    .select("perfis(id, email, nome_completo)")
    .eq("turma_id", turmaId);

  if (error) throw mapearErroBanco(error, "Falha ao buscar alunos da turma");

  return (data ?? [])
    .map((linha) => normalizarPerfil((linha as Record<string, unknown>).perfis))
    .filter((perfil): perfil is MembroTurma => perfil !== null);
}

export async function existe(turmaId: string): Promise<boolean> {
  const { data, error } = await db().from("turmas").select("id").eq("id", turmaId).maybeSingle();

  if (error) throw mapearErroBanco(error, "Falha ao verificar a turma");
  return data !== null;
}

export async function desvincularAlunoDeTodasAsTurmas(alunoId: string): Promise<void> {
  const { error } = await db().from("turma_alunos").delete().eq("aluno_id", alunoId);
  if (error) throw mapearErroBanco(error, "Falha ao desvincular o aluno da turma anterior");
}

export async function vincularAluno(turmaId: string, alunoId: string): Promise<void> {
  const { error } = await db()
    .from("turma_alunos")
    .insert({ turma_id: turmaId, aluno_id: alunoId });

  if (error) throw mapearErroBanco(error, "Falha ao adicionar o aluno");
}

export async function desvincularAluno(turmaId: string, alunoId: string): Promise<void> {
  const { error } = await db()
    .from("turma_alunos")
    .delete()
    .eq("turma_id", turmaId)
    .eq("aluno_id", alunoId);

  if (error) throw mapearErroBanco(error, "Falha ao remover o aluno");
}

export async function vincularProfessor(turmaId: string, professorId: string): Promise<void> {
  const { error } = await db()
    .from("turma_professores")
    .insert({ turma_id: turmaId, professor_id: professorId });

  if (error) {
    if (error.code === "23505") {
      throw new ErroConflito("Este professor já está vinculado a esta turma");
    }
    throw mapearErroBanco(error, "Falha ao adicionar o professor");
  }
}

export async function desvincularProfessor(turmaId: string, professorId: string): Promise<void> {
  const { error } = await db()
    .from("turma_professores")
    .delete()
    .eq("turma_id", turmaId)
    .eq("professor_id", professorId);

  if (error) throw mapearErroBanco(error, "Falha ao remover o professor");
}
