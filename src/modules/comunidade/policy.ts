export const CARGOS_GESTAO_COMUNIDADE = ["gestor", "admin"] as const;

export function podeGerenciarComunidade(cargo: string | null | undefined): boolean {
  if (!cargo) return false;
  return (CARGOS_GESTAO_COMUNIDADE as readonly string[]).includes(cargo);
}
