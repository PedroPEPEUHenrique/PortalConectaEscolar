import type { NextRequest } from "next/server";
import { lerCorpoJson, responderCriado, responderOk, rota, validar } from "@/lib/http";
import { POLITICAS } from "@/lib/rate-limit";
import { criarFeedbackSchema } from "@/modules/feedbacks/schema";
import { enviarFeedback, listarFeedbacks } from "@/modules/feedbacks/service";

export const GET = rota(async () => {
  return responderOk(await listarFeedbacks());
}, POLITICAS.leitura);

export const POST = rota(async (request: NextRequest) => {
  const dados = validar(criarFeedbackSchema, await lerCorpoJson(request));

  await enviarFeedback(dados);
  return responderCriado({ mensagem: "Feedback enviado com sucesso" });
}, POLITICAS.feedbackPublico);
