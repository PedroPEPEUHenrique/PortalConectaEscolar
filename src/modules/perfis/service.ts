import "@/lib/apenas-servidor";
import * as repositorio from "./repository";
import type { Cargo, Perfil } from "./schema";

export async function listarUsuarios(cargo?: Cargo): Promise<Perfil[]> {
  return repositorio.listar(cargo);
}
