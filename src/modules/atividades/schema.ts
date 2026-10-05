import { z } from "zod";

export const STATUS_ATIVIDADE = ["Pendente", "Em andamento", "Concluído"] as const;
export type StatusAtividade = (typeof STATUS_ATIVIDADE)[number];

export const TAMANHO_MAX_PDF = 10 * 1024 * 1024;
export const MIME_PDF = "application/pdf";

export const criarAtividadeSchema = z.object({
  titulo: z.string().trim().min(1, "Título obrigatório").max(200),
  descricao: z.string().trim().max(2000).default(""),
  status: z.enum(STATUS_ATIVIDADE),
  arquivo_pdf_url: z.string().url().nullable().optional(),
});

export const atualizarAtividadeSchema = criarAtividadeSchema
  .partial()
  .refine((valores) => Object.keys(valores).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const idAtividadeSchema = z.string().uuid();

export type CriarAtividade = z.infer<typeof criarAtividadeSchema>;
export type AtualizarAtividade = z.infer<typeof atualizarAtividadeSchema>;

export type Atividade = {
  id: string;
  titulo: string;
  descricao: string;
  status: StatusAtividade;
  arquivo_pdf_url: string | null;
  created_at: string;
};
