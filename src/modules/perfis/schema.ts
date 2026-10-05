import { z } from "zod";

export const CARGOS = ["aluno", "professor", "gestor", "admin"] as const;
export type Cargo = (typeof CARGOS)[number];

export const cargoSchema = z.enum(CARGOS);
export const idPerfilSchema = z.string().uuid();

export type Perfil = {
  id: string;
  email: string | null;
  nome_completo: string | null;
  cargo: Cargo;
};
