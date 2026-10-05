import "@/lib/apenas-servidor";
import * as repositorio from "./repository";
import type { AtualizarAviso, Aviso, CriarAviso } from "./schema";

const LIMITE_LISTAGEM = 100;

export async function listarAvisos(): Promise<Aviso[]> {
  return repositorio.listar(LIMITE_LISTAGEM);
}

export async function criarAviso(dados: CriarAviso): Promise<Aviso> {
  return repositorio.inserir(dados);
}

export async function atualizarAviso(id: string, dados: AtualizarAviso): Promise<Aviso> {
  return repositorio.atualizar(id, dados);
}

export async function excluirAviso(id: string): Promise<void> {
  return repositorio.remover(id);
}
