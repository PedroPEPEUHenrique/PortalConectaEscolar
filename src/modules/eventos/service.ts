import "@/lib/apenas-servidor";
import type { Ordenacao } from "@/lib/ordenacao";
import * as repositorio from "./repository";
import { ORDENACAO_PADRAO } from "./schema";
import type { AtualizarEvento, ColunaOrdenavel, CriarEvento, Evento } from "./schema";

const LIMITE_LISTAGEM = 500;

export async function listarEventos(
  ordenacao: Ordenacao<ColunaOrdenavel> = ORDENACAO_PADRAO
): Promise<Evento[]> {
  return repositorio.listar(LIMITE_LISTAGEM, ordenacao);
}

export async function criarEvento(dados: CriarEvento): Promise<Evento> {
  return repositorio.inserir(dados);
}

export async function atualizarEvento(id: string, dados: AtualizarEvento): Promise<Evento> {
  return repositorio.atualizar(id, dados);
}

export async function excluirEvento(id: string): Promise<void> {
  return repositorio.remover(id);
}
