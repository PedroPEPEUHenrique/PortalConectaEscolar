import type { NextRequest } from "next/server";
import {
  lerCorpoJson,
  responderCriado,
  responderMensagem,
  responderOk,
  rota,
  validar,
  validarParam,
} from "@/lib/http";
import { POLITICAS } from "@/lib/rate-limit";
import { idTurmaSchema, membroSchema } from "@/modules/turmas/schema";
import { adicionarMembro, listarMembros, removerMembro } from "@/modules/turmas/service";

type Contexto = { params: Promise<{ id: string }> };

export const GET = rota(async (_request: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const idTurma = validarParam(idTurmaSchema, id);

  return responderOk(await listarMembros(idTurma));
}, POLITICAS.leitura);

export const POST = rota(async (request: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const idTurma = validarParam(idTurmaSchema, id);
  const membro = validar(membroSchema, await lerCorpoJson(request));

  await adicionarMembro(idTurma, membro);
  return responderCriado({ mensagem: "Membro adicionado" });
}, POLITICAS.escrita);

export const DELETE = rota(async (request: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const idTurma = validarParam(idTurmaSchema, id);
  const membro = validar(membroSchema, await lerCorpoJson(request));

  await removerMembro(idTurma, membro);
  return responderMensagem("Membro removido");
}, POLITICAS.escrita);
