import "@/lib/apenas-servidor";
import { db } from "@/lib/db";
import { mapearErroBanco } from "@/lib/errors";
import type { Ordenacao } from "@/lib/ordenacao";
import type { ColunaOrdenavel, CriarFeedback, Feedback } from "./schema";

const COLUNAS = "id, nome, email, tipo, mensagem, created_at";

export async function listar(
  limite: number,
  ordenacao: Ordenacao<ColunaOrdenavel>
): Promise<Feedback[]> {
  const { data, error } = await db()
    .from("feedbacks")
    .select(COLUNAS)
    .order(ordenacao.coluna, { ascending: ordenacao.ascendente })
    .limit(limite);

  if (error) throw mapearErroBanco(error, "Falha ao buscar feedbacks");
  return (data ?? []) as Feedback[];
}

export async function inserir(dados: CriarFeedback): Promise<void> {
  const { error } = await db().from("feedbacks").insert([dados]);
  if (error) throw mapearErroBanco(error, "Falha ao enviar feedback");
}
