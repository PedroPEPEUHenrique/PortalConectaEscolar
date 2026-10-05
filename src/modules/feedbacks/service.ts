import "@/lib/apenas-servidor";
import * as repositorio from "./repository";
import type { CriarFeedback, Feedback } from "./schema";

const LIMITE_LISTAGEM = 500;

export async function listarFeedbacks(): Promise<Feedback[]> {
  return repositorio.listar(LIMITE_LISTAGEM);
}

export async function enviarFeedback(dados: CriarFeedback): Promise<void> {
  return repositorio.inserir(dados);
}
