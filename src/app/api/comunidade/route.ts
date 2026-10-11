import type { NextRequest } from "next/server";
import { lerCorpoJson, responderCriado, responderOk, rota, validar } from "@/lib/http";
import { POLITICAS } from "@/lib/rate-limit";
import { criarAvisoSchema } from "@/modules/comunidade/schema";
import { criarAviso, listarAvisos } from "@/modules/comunidade/service";

export const GET = rota(async () => {
  return responderOk(await listarAvisos());
}, POLITICAS.leitura);

export const POST = rota(async (request: NextRequest) => {
  const dados = validar(criarAvisoSchema, await lerCorpoJson(request));
  return responderCriado(await criarAviso(dados));
}, POLITICAS.escrita);
