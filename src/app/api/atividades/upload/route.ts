import type { NextRequest } from "next/server";
import { lerArquivo, responderCriado, rota } from "@/lib/http";
import { enviarPdfAtividade } from "@/modules/atividades/service";

export const POST = rota(async (request: NextRequest) => {
  const arquivo = await lerArquivo(request, "arquivo");
  return responderCriado(await enviarPdfAtividade(arquivo));
});
