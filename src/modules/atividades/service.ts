import "@/lib/apenas-servidor";
import { ErroValidacao } from "@/lib/errors";
import * as repositorio from "./repository";
import {
  MIME_PDF,
  TAMANHO_MAX_PDF,
  type Atividade,
  type AtualizarAtividade,
  type CriarAtividade,
} from "./schema";

const LIMITE_LISTAGEM = 200;

export async function listarAtividades(): Promise<Atividade[]> {
  return repositorio.listar(LIMITE_LISTAGEM);
}

export async function criarAtividade(dados: CriarAtividade): Promise<Atividade> {
  return repositorio.inserir(dados);
}

export async function atualizarAtividade(
  id: string,
  dados: AtualizarAtividade
): Promise<Atividade> {
  return repositorio.atualizar(id, dados);
}

export async function excluirAtividade(id: string): Promise<void> {
  return repositorio.remover(id);
}

export async function enviarPdfAtividade(arquivo: File): Promise<{ url: string }> {
  if (arquivo.type !== MIME_PDF) {
    throw new ErroValidacao("Apenas arquivos PDF são aceitos");
  }
  if (arquivo.size === 0) {
    throw new ErroValidacao("O arquivo está vazio");
  }
  if (arquivo.size > TAMANHO_MAX_PDF) {
    throw new ErroValidacao("O PDF deve ter no máximo 10 MB");
  }
  const url = await repositorio.enviarPdf(arquivo);
  return { url };
}
