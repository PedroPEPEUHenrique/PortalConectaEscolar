import { z } from "zod";

import type { Ordenacao } from "@/lib/ordenacao";

export const CARGOS = ["aluno", "professor", "gestor", "admin"] as const;
export type Cargo = (typeof CARGOS)[number];

export const cargoSchema = z.enum(CARGOS);
export const COLUNAS_ORDENAVEIS = ["email", "nome_completo", "cargo"] as const;
export type ColunaOrdenavel = (typeof COLUNAS_ORDENAVEIS)[number];

export const ORDENACAO_PADRAO: Ordenacao<ColunaOrdenavel> = {
  coluna: "email",
  ascendente: true,
};

export const idPerfilSchema = z.string().uuid();

export type Perfil = {
  id: string;
  email: string | null;
  nome_completo: string | null;
  cargo: Cargo;
};
