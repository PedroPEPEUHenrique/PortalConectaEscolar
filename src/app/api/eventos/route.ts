import type { NextRequest } from "next/server";
import { lerCorpoJson, responderCriado, responderOk, rota, validar } from "@/lib/http";
import { criarEventoSchema } from "@/modules/eventos/schema";
import { criarEvento, listarEventos } from "@/modules/eventos/service";

export const GET = rota(async () => {
  return responderOk(await listarEventos());
});

export const POST = rota(async (request: NextRequest) => {
  const dados = validar(criarEventoSchema, await lerCorpoJson(request));
  return responderCriado(await criarEvento(dados));
});
