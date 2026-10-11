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

const CONFIAR_EM_PROXY = process.env.RATE_LIMIT_TRUST_PROXY !== "false";

const IP_DESCONHECIDO = "ip-desconhecido";

export function identificarOrigem(request: Request): string {
  if (!CONFIAR_EM_PROXY) return IP_DESCONHECIDO;

  const encaminhado = request.headers.get("x-forwarded-for");
  if (encaminhado) {
    const primeiro = encaminhado.split(",")[0]?.trim();
    if (primeiro) return primeiro;
  }

  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;

  return IP_DESCONHECIDO;
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
