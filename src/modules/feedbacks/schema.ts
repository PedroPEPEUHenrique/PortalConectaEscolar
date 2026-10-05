import { z } from "zod";

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

export type CriarFeedback = z.infer<typeof criarFeedbackSchema>;

export type Feedback = {
  id: string;
  nome: string;
  email: string;
  tipo: TipoFeedback;
  mensagem: string;
  created_at: string;
};
