import type { NextRequest } from "next/server";
import { lerCorpoJson, responderCriado, responderOk, rota, validar } from "@/lib/http";
import { POLITICAS } from "@/lib/rate-limit";
import { criarTurmaSchema } from "@/modules/turmas/schema";
import { criarTurma, listarTurmas } from "@/modules/turmas/service";

export const GET = rota(async () => {
  return responderOk(await listarTurmas());
}, POLITICAS.leitura);

export const POST = rota(async (request: NextRequest) => {
  const dados = validar(criarTurmaSchema, await lerCorpoJson(request));
  return responderCriado(await criarTurma(dados));
}, POLITICAS.escrita);
