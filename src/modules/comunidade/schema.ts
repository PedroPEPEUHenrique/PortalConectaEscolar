import { z } from "zod";

import type { Ordenacao } from "@/lib/ordenacao";

export const criarAvisoSchema = z.object({
  autor: z.string().trim().min(1, "Autor obrigatório").max(100),
  mensagem: z.string().trim().min(1, "Mensagem obrigatória").max(1000),
});

export const atualizarAvisoSchema = criarAvisoSchema
  .partial()
  .refine((valores) => Object.keys(valores).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const COLUNAS_ORDENAVEIS = ["created_at", "autor"] as const;
export type ColunaOrdenavel = (typeof COLUNAS_ORDENAVEIS)[number];

export const ORDENACAO_PADRAO: Ordenacao<ColunaOrdenavel> = {
  coluna: "created_at",
  ascendente: false,
};

export const idAvisoSchema = z.string().uuid();

export type CriarAviso = z.infer<typeof criarAvisoSchema>;
export type AtualizarAviso = z.infer<typeof atualizarAvisoSchema>;

export type Aviso = {
  id: string;
  autor: string;
  mensagem: string;
  created_at: string;
};
