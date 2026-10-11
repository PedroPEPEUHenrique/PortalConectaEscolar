import type { NextRequest } from "next/server";
import {
  lerCorpoJson,
  responderMensagem,
  responderOk,
  rota,
  validar,
  validarParam,
} from "@/lib/http";
import { POLITICAS } from "@/lib/rate-limit";
import { atualizarAvisoSchema, idAvisoSchema } from "@/modules/comunidade/schema";
import { atualizarAviso, excluirAviso } from "@/modules/comunidade/service";

type Contexto = { params: Promise<{ id: string }> };

export const PUT = rota(async (request: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const idAviso = validarParam(idAvisoSchema, id);
  const dados = validar(atualizarAvisoSchema, await lerCorpoJson(request));

  return responderOk(await atualizarAviso(idAviso, dados));
}, POLITICAS.escrita);

export const DELETE = rota(async (_request: NextRequest, { params }: Contexto) => {
  const { id } = await params;
  const idAviso = validarParam(idAvisoSchema, id);

  await excluirAviso(idAviso);
  return responderMensagem("Aviso excluído com sucesso");
}, POLITICAS.escrita);
