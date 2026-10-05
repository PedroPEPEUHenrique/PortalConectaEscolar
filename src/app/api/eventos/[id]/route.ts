import type { NextRequest } from "next/server";
import {
  lerCorpoJson,
  responderMensagem,
  responderOk,
  rota,
  validar,
  validarParam,
} from "@/lib/http";
import { atualizarEventoSchema, idEventoSchema } from "@/modules/eventos/schema";
import { atualizarEvento, excluirEvento } from "@/modules/eventos/service";

type Contexto = { params: Promise<{ id: string }> };

export const PUT = rota(async (request: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const idEvento = validarParam(idEventoSchema, id);
  const dados = validar(atualizarEventoSchema, await lerCorpoJson(request));

  return responderOk(await atualizarEvento(idEvento, dados));
});

export const DELETE = rota(async (_request: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const idEvento = validarParam(idEventoSchema, id);

  await excluirEvento(idEvento);
  return responderMensagem("Evento excluído com sucesso");
});
