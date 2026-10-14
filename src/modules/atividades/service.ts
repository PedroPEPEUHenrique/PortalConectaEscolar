import "@/lib/apenas-servidor";
import { ErroValidacao } from "@/lib/errors";
import type { Ordenacao } from "@/lib/ordenacao";
import * as repositorio from "./repository";
import {
  ASSINATURA_PDF,
  MIME_PDF,
  ORDENACAO_PADRAO,
  TAMANHO_MAX_PDF,
  type Atividade,
  type AtualizarAtividade,
  type ColunaOrdenavel,
  type CriarAtividade,
} from "./schema";

const LIMITE_LISTAGEM = 200;

export async function listarAtividades(
  ordenacao: Ordenacao<ColunaOrdenavel> = ORDENACAO_PADRAO
): Promise<Atividade[]> {
  return repositorio.listar(LIMITE_LISTAGEM, ordenacao);
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

async function temAssinaturaPdf(arquivo: File): Promise<boolean> {
  const inicio = arquivo.slice(0, ASSINATURA_PDF.length);
  const bytes = new Uint8Array(await inicio.arrayBuffer());
  return new TextDecoder("latin1").decode(bytes) === ASSINATURA_PDF;
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
  if (!(await temAssinaturaPdf(arquivo))) {
    throw new ErroValidacao("O conteúdo do arquivo não é um PDF");
  }

  const url = await repositorio.enviarPdf(arquivo);
  return { url };
}
