import "@/lib/apenas-servidor";
import { db } from "@/lib/db";
import { ErroNaoEncontrado, mapearErroBanco } from "@/lib/errors";
import type { AtualizarEvento, CriarEvento, Evento } from "./schema";

const COLUNAS = "id, data, evento, tipo, created_at";

export async function listar(limite: number): Promise<Evento[]> {
  const { data, error } = await db()
    .from("eventos")
    .select(COLUNAS)
    .order("data", { ascending: true })
    .limit(limite);

  if (error) throw mapearErroBanco(error, "Falha ao buscar eventos");
  return (data ?? []) as Evento[];
}

export async function inserir(dados: CriarEvento): Promise<Evento> {
  const { data, error } = await db().from("eventos").insert([dados]).select(COLUNAS).single();

  if (error) throw mapearErroBanco(error, "Falha ao criar evento");
  return data as Evento;
}

export async function atualizar(id: string, dados: AtualizarEvento): Promise<Evento> {
  const { data, error } = await db().from("eventos").update(dados).eq("id", id).select(COLUNAS);

  if (error) throw mapearErroBanco(error, "Falha ao atualizar evento");
  if (!data?.length) throw new ErroNaoEncontrado("Evento não encontrado");
  return data[0] as Evento;
}

export async function remover(id: string): Promise<void> {
  const { data, error } = await db().from("eventos").delete().eq("id", id).select("id");

  if (error) throw mapearErroBanco(error, "Falha ao excluir evento");
  if (!data?.length) throw new ErroNaoEncontrado("Evento não encontrado");
}
