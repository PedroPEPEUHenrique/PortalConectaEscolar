import type { NextRequest } from "next/server";
import {
  lerCorpoJson,
  responderMensagem,
  responderOk,
  rota,
  validar,
  validarParam,
} from "@/lib/http";
import { atualizarAtividadeSchema, idAtividadeSchema } from "@/modules/atividades/schema";
import { atualizarAtividade, excluirAtividade } from "@/modules/atividades/service";

type Contexto = { params: Promise<{ id: string }> };

export const PUT = rota(async (request: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const idAtividade = validarParam(idAtividadeSchema, id);
  const dados = validar(atualizarAtividadeSchema, await lerCorpoJson(request));

  return responderOk(await atualizarAtividade(idAtividade, dados));
});

export const DELETE = rota(async (_request: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const idAtividade = validarParam(idAtividadeSchema, id);

  await excluirAtividade(idAtividade);
  return responderMensagem("Atividade excluída com sucesso");
});
