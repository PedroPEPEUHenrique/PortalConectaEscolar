import type { NextRequest } from "next/server";
import { lerArquivo, responderCriado, rota } from "@/lib/http";
import { POLITICAS } from "@/lib/rate-limit";
import { TAMANHO_MAX_ENVELOPE_PDF } from "@/modules/atividades/schema";
import { enviarPdfAtividade } from "@/modules/atividades/service";

export const POST = rota(async (request: NextRequest) => {
  const arquivo = await lerArquivo(request, "arquivo", TAMANHO_MAX_ENVELOPE_PDF);
  return responderCriado(await enviarPdfAtividade(arquivo));
}, POLITICAS.upload);
