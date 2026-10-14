import { ErroOrigemNaoPermitida } from "./errors";

const ORIGENS_PERMITIDAS = (process.env.CORS_ORIGENS_PERMITIDAS ?? "")
  .split(",")
  .map((origem) => origem.trim())
  .filter(Boolean);

const METODOS_SEGUROS = new Set(["GET", "HEAD", "OPTIONS"]);

const METODOS_EXPOSTOS = "GET, POST, PUT, DELETE, OPTIONS";

const CABECALHOS_EXPOSTOS = "Content-Type";

const MAX_IDADE_PREFLIGHT = "600";

export function temAllowlist(): boolean {
  return ORIGENS_PERMITIDAS.length > 0;
}

function hostDaRequisicao(request: Request): string | null {
  return request.headers.get("x-forwarded-host") ?? request.headers.get("host");
}

function mesmaOrigem(origem: string, request: Request): boolean {
  const host = hostDaRequisicao(request);
  if (!host) return false;
  try {
    return new URL(origem).host === host;
  } catch {
    return false;
  }
}

export function origemNaAllowlist(origem: string | null): boolean {
  return origem !== null && ORIGENS_PERMITIDAS.includes(origem);
}

export function cabecalhosCors(request: Request): Record<string, string> {
  const origem = request.headers.get("origin");
  if (!origemNaAllowlist(origem) || origem === null) return {};

  return {
    "Access-Control-Allow-Origin": origem,
    "Access-Control-Allow-Methods": METODOS_EXPOSTOS,
    "Access-Control-Allow-Headers": CABECALHOS_EXPOSTOS,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": MAX_IDADE_PREFLIGHT,
    Vary: "Origin",
  };
}

export function exigirOrigemConfiavel(request: Request): void {
  if (METODOS_SEGUROS.has(request.method)) return;

  const origem = request.headers.get("origin");
  const destino = request.headers.get("sec-fetch-site");

  if (destino === "same-origin" || destino === "none") return;

  if (destino === null && origem === null) return;

  if (origem !== null && (mesmaOrigem(origem, request) || origemNaAllowlist(origem))) {
    return;
  }

  throw new ErroOrigemNaoPermitida();
}
