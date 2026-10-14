import "@/lib/apenas-servidor";
import { db } from "@/lib/db";
import { ErroInterno, ErroNaoEncontrado, mapearErroBanco } from "@/lib/errors";
import type { Ordenacao } from "@/lib/ordenacao";
import type {
  Atividade,
  AtualizarAtividade,
  ColunaOrdenavel,
  CriarAtividade,
} from "./schema";
import { MIME_PDF } from "./schema";

const COLUNAS = "id, titulo, descricao, status, arquivo_pdf_url, created_at";
const BUCKET = "atividades_pdfs";

export async function listar(
  limite: number,
  ordenacao: Ordenacao<ColunaOrdenavel>
): Promise<Atividade[]> {
  const { data, error } = await db()
    .from("atividades")
    .select(COLUNAS)
    .order(ordenacao.coluna, { ascending: ordenacao.ascendente })
    .limit(limite);

  if (error) throw mapearErroBanco(error, "Falha ao buscar atividades");
  return (data ?? []) as Atividade[];
}

export async function inserir(dados: CriarAtividade): Promise<Atividade> {
  const { data, error } = await db().from("atividades").insert([dados]).select(COLUNAS).single();

  if (error) throw mapearErroBanco(error, "Falha ao criar atividade");
  return data as Atividade;
}

export async function atualizar(id: string, dados: AtualizarAtividade): Promise<Atividade> {
  const { data, error } = await db()
    .from("atividades")
    .update(dados)
    .eq("id", id)
    .select(COLUNAS);

  if (error) throw mapearErroBanco(error, "Falha ao atualizar atividade");
  if (!data?.length) throw new ErroNaoEncontrado("Atividade não encontrada");
  return data[0] as Atividade;
}

export async function remover(id: string): Promise<void> {
  const { data, error } = await db().from("atividades").delete().eq("id", id).select("id");

  if (error) throw mapearErroBanco(error, "Falha ao excluir atividade");
  if (!data?.length) throw new ErroNaoEncontrado("Atividade não encontrada");
}

export async function enviarPdf(arquivo: File): Promise<string> {
  const nome = `atividade-${Date.now()}-${crypto.randomUUID()}.pdf`;
  const cliente = db();

  const { error } = await cliente.storage
    .from(BUCKET)
    .upload(nome, arquivo, { contentType: MIME_PDF, upsert: false });

  if (error) throw new ErroInterno("Falha ao enviar o PDF", { causa: error });

  const { data } = cliente.storage.from(BUCKET).getPublicUrl(nome);
  return data.publicUrl;
}
