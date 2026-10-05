import type { NextRequest } from "next/server";
import { lerCorpoJson, responderCriado, responderOk, rota, validar } from "@/lib/http";
import { criarAtividadeSchema } from "@/modules/atividades/schema";
import { criarAtividade, listarAtividades } from "@/modules/atividades/service";

export const GET = rota(async () => {
  return responderOk(await listarAtividades());
});

export const POST = rota(async (request: NextRequest) => {
  const dados = validar(criarAtividadeSchema, await lerCorpoJson(request));
  return responderCriado(await criarAtividade(dados));
});
