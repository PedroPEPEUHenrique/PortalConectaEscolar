import "@/lib/apenas-servidor";
import type { Ordenacao } from "@/lib/ordenacao";
import * as repositorio from "./repository";
import { ORDENACAO_PADRAO } from "./schema";
import type { AtualizarAviso, Aviso, ColunaOrdenavel, CriarAviso } from "./schema";

const LIMITE_LISTAGEM = 100;

export async function listarAvisos(
  ordenacao: Ordenacao<ColunaOrdenavel> = ORDENACAO_PADRAO
): Promise<Aviso[]> {
  return repositorio.listar(LIMITE_LISTAGEM, ordenacao);
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
