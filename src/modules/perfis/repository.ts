import "@/lib/apenas-servidor";
import { db } from "@/lib/db";
import { mapearErroBanco } from "@/lib/errors";
import type { Ordenacao } from "@/lib/ordenacao";
import type { Cargo, ColunaOrdenavel, Perfil } from "./schema";

const COLUNAS = "id, email, nome_completo, cargo";

export async function listar(
  ordenacao: Ordenacao<ColunaOrdenavel>,
  cargo?: Cargo
): Promise<Perfil[]> {
  let consulta = db().from("perfis").select(COLUNAS);
  if (cargo) consulta = consulta.eq("cargo", cargo);

  const { data, error } = await consulta.order(ordenacao.coluna, {
    ascending: ordenacao.ascendente,
  });

  if (error) throw mapearErroBanco(error, "Falha ao buscar usuários");
  return (data ?? []) as Perfil[];
}
