import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AppError,
  ErroCorpoGrande,
  ErroInterno,
  ErroLimiteExcedido,
  ErroValidacao,
} from "./errors";
import { cabecalhosCors, exigirOrigemConfiavel } from "./origem";
import { exigirDentroDoLimite, type Politica } from "./rate-limit";

export const CABECALHOS_SEGURANCA = {
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
} as const;

export const TAMANHO_MAX_CORPO_JSON = 64 * 1024;

export function responderOk<T>(dados: T, status = 200): NextResponse {
  return NextResponse.json(dados, { status, headers: CABECALHOS_SEGURANCA });
}

export function responderCriado<T>(dados: T): NextResponse {
  return responderOk(dados, 201);
}

export function responderMensagem(mensagem: string, status = 200): NextResponse {
  return responderOk({ mensagem }, status);
}

function responderErro(erro: AppError): NextResponse {
  return NextResponse.json(
    {
      erro: erro.message,
      ...(erro.detalhes ? { detalhes: erro.detalhes } : {}),
      ...(erro instanceof ErroLimiteExcedido
        ? { repetirApos: erro.repetirAposSegundos }
        : {}),
    },
    {
      status: erro.status,
      headers: { ...CABECALHOS_SEGURANCA, ...erro.cabecalhos },
    }
  );
}

export function rota<Args extends [Request, ...unknown[]]>(
  handler: (...args: Args) => Promise<NextResponse>,
  politica?: Politica
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    const request = args[0];
    let resposta: NextResponse;

    try {
      exigirOrigemConfiavel(request);
      if (politica) await exigirDentroDoLimite(request, politica);
      resposta = await handler(...args);
    } catch (e) {
      const erro =
        e instanceof AppError ? e : new ErroInterno("Erro interno do servidor", { causa: e });

      if (erro.status >= 500) {
        console.error(`[${erro.codigo}] ${erro.message}`, erro.causa ?? e);
      }
      resposta = responderErro(erro);
    }

    for (const [chave, valor] of Object.entries(cabecalhosCors(request))) {
      resposta.headers.set(chave, valor);
    }
    return resposta;
  };
}

function exigirTamanhoDeclaradoAceitavel(request: Request, tamanhoMaximo: number): void {
  const declarado = request.headers.get("content-length");
  if (declarado === null) return;

  const tamanho = Number(declarado);
  if (!Number.isFinite(tamanho) || tamanho < 0) {
    throw new AppError("VALIDACAO", 400, "Content-Length inválido");
  }
  if (tamanho > tamanhoMaximo) {
    throw new ErroCorpoGrande();
  }
}

export async function lerCorpoJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new AppError("VALIDACAO", 415, "Content-Type deve ser application/json");
  }

  exigirTamanhoDeclaradoAceitavel(request, TAMANHO_MAX_CORPO_JSON);

  try {
    return await request.json();
  } catch {
    throw new AppError("VALIDACAO", 400, "Corpo da requisição não é um JSON válido");
  }
}

export function validar<S extends z.ZodTypeAny>(schema: S, dados: unknown): z.infer<S> {
  const resultado = schema.safeParse(dados);
  if (!resultado.success) {
    const { fieldErrors, formErrors } = resultado.error.flatten();

    throw new ErroValidacao(formErrors[0] ?? "Dados inválidos", {
      detalhes: fieldErrors as Record<string, string[] | undefined>,
    });
  }
  return resultado.data;
}

export function validarParam<S extends z.ZodTypeAny>(
  schema: S,
  valor: unknown,
  nome = "ID"
): z.infer<S> {
  const resultado = schema.safeParse(valor);
  if (!resultado.success) {
    throw new AppError("VALIDACAO", 400, `${nome} inválido`);
  }
  return resultado.data;
}

export async function lerArquivo(
  request: Request,
  campo: string,
  tamanhoMaximoEnvelope: number
): Promise<File> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    throw new AppError("VALIDACAO", 415, "Content-Type deve ser multipart/form-data");
  }

  exigirTamanhoDeclaradoAceitavel(request, tamanhoMaximoEnvelope);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new AppError("VALIDACAO", 400, "Formulário inválido");
  }

  const arquivo = form.get(campo);
  if (!(arquivo instanceof File)) {
    throw new ErroValidacao(`Campo "${campo}" é obrigatório e deve ser um arquivo`);
  }
  return arquivo;
}
