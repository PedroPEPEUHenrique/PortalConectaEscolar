import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError, ErroInterno, ErroValidacao } from "./errors";

export const CABECALHOS_SEGURANCA = {
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
} as const;

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
    { erro: erro.message, ...(erro.detalhes ? { detalhes: erro.detalhes } : {}) },
    { status: erro.status, headers: CABECALHOS_SEGURANCA }
  );
}

export function rota<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (e) {
      const erro =
        e instanceof AppError ? e : new ErroInterno("Erro interno do servidor", { causa: e });

      if (erro.status >= 500) {
        console.error(`[${erro.codigo}] ${erro.message}`, erro.causa ?? e);
      }
      return responderErro(erro);
    }
  };
}

export async function lerCorpoJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new AppError("VALIDACAO", 415, "Content-Type deve ser application/json");
  }
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

export async function lerArquivo(request: Request, campo: string): Promise<File> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    throw new AppError("VALIDACAO", 415, "Content-Type deve ser multipart/form-data");
  }
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
