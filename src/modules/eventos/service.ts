import "@/lib/apenas-servidor";
import * as repositorio from "./repository";
import type { AtualizarEvento, CriarEvento, Evento } from "./schema";

const LIMITE_LISTAGEM = 500;

export async function listarEventos(): Promise<Evento[]> {
  return repositorio.listar(LIMITE_LISTAGEM);
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
