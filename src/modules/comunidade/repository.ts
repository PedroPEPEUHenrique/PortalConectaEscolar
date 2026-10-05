import "@/lib/apenas-servidor";
import { db } from "@/lib/db";
import { ErroNaoEncontrado, mapearErroBanco } from "@/lib/errors";
import type { AtualizarAviso, Aviso, CriarAviso } from "./schema";

const COLUNAS = "id, autor, mensagem, created_at";

export async function listar(limite: number): Promise<Aviso[]> {
  const { data, error } = await db()
    .from("comunidade")
    .select(COLUNAS)
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error) throw mapearErroBanco(error, "Falha ao buscar avisos");
  return (data ?? []) as Aviso[];
}

export async function inserir(dados: CriarAviso): Promise<Aviso> {
  const { data, error } = await db().from("comunidade").insert([dados]).select(COLUNAS).single();

  if (error) throw mapearErroBanco(error, "Falha ao criar aviso");
  return data as Aviso;
}

export async function atualizar(id: string, dados: AtualizarAviso): Promise<Aviso> {
  const { data, error } = await db().from("comunidade").update(dados).eq("id", id).select(COLUNAS);

  if (error) throw mapearErroBanco(error, "Falha ao atualizar aviso");
  if (!data?.length) throw new ErroNaoEncontrado("Aviso não encontrado");
  return data[0] as Aviso;
}

export async function remover(id: string): Promise<void> {
  const { data, error } = await db().from("comunidade").delete().eq("id", id).select("id");

  if (error) throw mapearErroBanco(error, "Falha ao excluir aviso");
  if (!data?.length) throw new ErroNaoEncontrado("Aviso não encontrado");
}
