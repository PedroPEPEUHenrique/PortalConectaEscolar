import "@/lib/apenas-servidor";
import { ErroNaoEncontrado } from "@/lib/errors";
import * as repositorio from "./repository";
import type {
  AtualizarTurma,
  CriarTurma,
  Membro,
  MembrosTurma,
  Turma,
  TurmaBase,
} from "./schema";

export async function listarTurmas(): Promise<Turma[]> {
  return repositorio.listarComVinculos();
}

export async function criarTurma(dados: CriarTurma): Promise<TurmaBase> {
  return repositorio.inserir(dados);
}

export async function atualizarTurma(id: string, dados: AtualizarTurma): Promise<TurmaBase> {
  return repositorio.atualizar(id, dados);
}

export async function excluirTurma(id: string): Promise<void> {
  return repositorio.remover(id);
}

export async function listarMembros(turmaId: string): Promise<MembrosTurma> {
  const [professores, alunos] = await Promise.all([
    repositorio.listarProfessores(turmaId),
    repositorio.listarAlunos(turmaId),
  ]);
  return { professores, alunos };
}

export async function adicionarMembro(turmaId: string, membro: Membro): Promise<void> {
  if (!(await repositorio.existe(turmaId))) {
    throw new ErroNaoEncontrado("Turma não encontrada");
  }

  if (membro.tipo === "aluno") {
    await repositorio.desvincularAlunoDeTodasAsTurmas(membro.user_id);
    await repositorio.vincularAluno(turmaId, membro.user_id);
    return;
  }

  await repositorio.vincularProfessor(turmaId, membro.user_id);
}

export async function removerMembro(turmaId: string, membro: Membro): Promise<void> {
  if (membro.tipo === "aluno") {
    await repositorio.desvincularAluno(turmaId, membro.user_id);
    return;
  }
  await repositorio.desvincularProfessor(turmaId, membro.user_id);
}
