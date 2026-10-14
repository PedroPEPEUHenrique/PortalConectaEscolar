import "@/lib/apenas-servidor";
import type { Ordenacao } from "@/lib/ordenacao";
import * as repositorio from "./repository";
import { ORDENACAO_PADRAO } from "./schema";
import type { Cargo, ColunaOrdenavel, Perfil } from "./schema";

export async function listarUsuarios(
  cargo?: Cargo,
  ordenacao: Ordenacao<ColunaOrdenavel> = ORDENACAO_PADRAO
): Promise<Perfil[]> {
  return repositorio.listar(ordenacao, cargo);
}
