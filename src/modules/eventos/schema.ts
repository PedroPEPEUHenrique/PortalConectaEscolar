import { z } from "zod";

import type { Ordenacao } from "@/lib/ordenacao";

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export const TIPOS_EVENTO = [
  "Avaliação",
  "Evento",
  "Reunião",
  "Acadêmico",
  "Esporte",
] as const;

export const criarEventoSchema = z.object({
  data: z.string().regex(DATA_ISO, "Data deve estar no formato AAAA-MM-DD"),
  evento: z.string().trim().min(1, "Nome do evento obrigatório").max(300),
  tipo: z.string().trim().max(50).default("geral"),
});

export const atualizarEventoSchema = criarEventoSchema
  .partial()
  .refine((valores) => Object.keys(valores).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const COLUNAS_ORDENAVEIS = ["data", "evento", "tipo", "created_at"] as const;
export type ColunaOrdenavel = (typeof COLUNAS_ORDENAVEIS)[number];

export const ORDENACAO_PADRAO: Ordenacao<ColunaOrdenavel> = {
  coluna: "data",
  ascendente: true,
};

export const idEventoSchema = z.string().uuid();

export type CriarEvento = z.infer<typeof criarEventoSchema>;
export type AtualizarEvento = z.infer<typeof atualizarEventoSchema>;

export type Evento = {
  id: string;
  data: string;
  evento: string;
  tipo: string;
  created_at: string;
};
