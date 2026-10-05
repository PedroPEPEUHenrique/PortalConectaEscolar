export const CARGOS_GESTAO_TURMAS = ["gestor", "admin"] as const;

export function podeGerenciarTurmas(cargo: string | null | undefined): boolean {
  if (!cargo) return false;
  return (CARGOS_GESTAO_TURMAS as readonly string[]).includes(cargo);
}
