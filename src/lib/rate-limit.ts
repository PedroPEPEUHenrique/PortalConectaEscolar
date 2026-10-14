import "./apenas-servidor";
import { db } from "./db";
import { ErroLimiteExcedido } from "./errors";

export type Politica = {
  nome: string;
  limite: number;
  janelaSegundos: number;
};

export type ResultadoLimite = {
  permitido: boolean;
  restantes: number;
  repetirAposSegundos: number;
};

export const POLITICAS = {
  leitura: { nome: "leitura", limite: 120, janelaSegundos: 60 },
  escrita: { nome: "escrita", limite: 60, janelaSegundos: 60 },
  upload: { nome: "upload", limite: 10, janelaSegundos: 3600 },
  feedbackPublico: { nome: "feedback-publico", limite: 3, janelaSegundos: 600 },
} satisfies Record<string, Politica>;

const PROXIES_CONFIAVEIS = Number(process.env.RATE_LIMIT_PROXIES_CONFIAVEIS ?? "1");

const TAMANHO_MAX_IDENTIFICADOR = 64;

const ORIGEM_INDETERMINADA = "origem-indeterminada";

const FORMATO_ENDERECO = /^[0-9a-fA-F.:]{3,45}$/;

export function identificarOrigem(request: Request): string {
  if (!Number.isInteger(PROXIES_CONFIAVEIS) || PROXIES_CONFIAVEIS < 1) {
    return ORIGEM_INDETERMINADA;
  }

  const encaminhado = request.headers.get("x-forwarded-for");
  if (!encaminhado) return ORIGEM_INDETERMINADA;

  const saltos = encaminhado
    .split(",")
    .map((salto) => salto.trim())
    .filter(Boolean);

  if (saltos.length === 0) return ORIGEM_INDETERMINADA;

  const indice = Math.max(0, saltos.length - PROXIES_CONFIAVEIS);
  const candidato = saltos[indice].slice(0, TAMANHO_MAX_IDENTIFICADOR);

  return FORMATO_ENDERECO.test(candidato) ? candidato : ORIGEM_INDETERMINADA;
}

async function consumir(chave: string, politica: Politica): Promise<ResultadoLimite> {
  const { data, error } = await db().rpc("consumir_rate_limit", {
    p_chave: chave,
    p_limite: politica.limite,
    p_janela_segundos: politica.janelaSegundos,
  });

  if (error) throw error;

  const linha = Array.isArray(data) ? data[0] : data;
  if (!linha) throw new Error("consumir_rate_limit nao retornou resultado");

  return {
    permitido: Boolean(linha.permitido),
    restantes: Number(linha.restantes ?? 0),
    repetirAposSegundos: Number(linha.repetir_apos_segundos ?? politica.janelaSegundos),
  };
}

export async function exigirDentroDoLimite(
  request: Request,
  politica: Politica
): Promise<void> {
  const chave = `${politica.nome}:${identificarOrigem(request)}`;

  let resultado: ResultadoLimite;
  try {
    resultado = await consumir(chave, politica);
  } catch (e) {
    console.error("[rate-limit] contador indisponivel, requisicao liberada", chave, e);
    return;
  }

  if (!resultado.permitido) {
    throw new ErroLimiteExcedido(resultado.repetirAposSegundos);
  }
}
