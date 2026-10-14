import { z } from "zod";

import type { Ordenacao } from "@/lib/ordenacao";

export const STATUS_ATIVIDADE = ["Pendente", "Em andamento", "Concluído"] as const;
export type StatusAtividade = (typeof STATUS_ATIVIDADE)[number];

export const TAMANHO_MAX_PDF = 10 * 1024 * 1024;
export const TAMANHO_MAX_ENVELOPE_PDF = TAMANHO_MAX_PDF + 8 * 1024;
export const MIME_PDF = "application/pdf";
export const ASSINATURA_PDF = "%PDF-";

const HOST_STORAGE = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
})();

const urlPdfSchema = z
  .string()
  .url()
  .refine((valor) => {
    if (!HOST_STORAGE) return false;
    try {
      const url = new URL(valor);
      return url.protocol === "https:" && url.host === HOST_STORAGE;
    } catch {
      return false;
    }
  }, "O PDF deve estar hospedado no storage do projeto via https");

export const criarAtividadeSchema = z.object({
  titulo: z.string().trim().min(1, "Título obrigatório").max(200),
  descricao: z.string().trim().max(2000).default(""),
  status: z.enum(STATUS_ATIVIDADE),
  arquivo_pdf_url: urlPdfSchema.nullable().optional(),
});

export const atualizarAtividadeSchema = criarAtividadeSchema
  .partial()
  .refine((valores) => Object.keys(valores).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const COLUNAS_ORDENAVEIS = ["created_at", "titulo", "status"] as const;
export type ColunaOrdenavel = (typeof COLUNAS_ORDENAVEIS)[number];

export const ORDENACAO_PADRAO: Ordenacao<ColunaOrdenavel> = {
  coluna: "created_at",
  ascendente: false,
};

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
