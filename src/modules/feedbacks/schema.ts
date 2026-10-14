import { z } from "zod";

import type { Ordenacao } from "@/lib/ordenacao";

export const TIPOS_FEEDBACK = [
  "Elogio",
  "Sugestão",
  "Reclamação",
  "Problema Técnico",
] as const;
export type TipoFeedback = (typeof TIPOS_FEEDBACK)[number];

export const criarFeedbackSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório").max(100),
  email: z.string().trim().email("E-mail inválido").max(254),
  tipo: z.enum(TIPOS_FEEDBACK),
  mensagem: z.string().trim().min(1, "Mensagem obrigatória").max(2000),
});

export const COLUNAS_ORDENAVEIS = ["created_at", "tipo", "nome"] as const;
export type ColunaOrdenavel = (typeof COLUNAS_ORDENAVEIS)[number];

export const ORDENACAO_PADRAO: Ordenacao<ColunaOrdenavel> = {
  coluna: "created_at",
  ascendente: false,
};

export type CriarFeedback = z.infer<typeof criarFeedbackSchema>;

export type Feedback = {
  id: string;
  nome: string;
  email: string;
  tipo: TipoFeedback;
  mensagem: string;
  created_at: string;
};
