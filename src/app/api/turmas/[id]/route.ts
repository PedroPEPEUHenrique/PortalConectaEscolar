import type { NextRequest } from "next/server";
import {
  lerCorpoJson,
  responderMensagem,
  responderOk,
  rota,
  validar,
  validarParam,
} from "@/lib/http";
import { atualizarTurmaSchema, idTurmaSchema } from "@/modules/turmas/schema";
import { atualizarTurma, excluirTurma } from "@/modules/turmas/service";

type Contexto = { params: Promise<{ id: string }> };

export const PUT = rota(async (request: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const idTurma = validarParam(idTurmaSchema, id);
  const dados = validar(atualizarTurmaSchema, await lerCorpoJson(request));

  return responderOk(await atualizarTurma(idTurma, dados));
});

export const DELETE = rota(async (_request: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const idTurma = validarParam(idTurmaSchema, id);

  await excluirTurma(idTurma);
  return responderMensagem("Turma excluída com sucesso");
});
