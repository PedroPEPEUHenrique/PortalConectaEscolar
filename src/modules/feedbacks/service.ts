import "@/lib/apenas-servidor";
import type { Ordenacao } from "@/lib/ordenacao";
import * as repositorio from "./repository";
import { ORDENACAO_PADRAO } from "./schema";
import type { ColunaOrdenavel, CriarFeedback, Feedback } from "./schema";

const LIMITE_LISTAGEM = 500;

export async function listarFeedbacks(
  ordenacao: Ordenacao<ColunaOrdenavel> = ORDENACAO_PADRAO
): Promise<Feedback[]> {
  return repositorio.listar(LIMITE_LISTAGEM, ordenacao);
}

export async function enviarFeedback(dados: CriarFeedback): Promise<void> {
  return repositorio.inserir(dados);
}
