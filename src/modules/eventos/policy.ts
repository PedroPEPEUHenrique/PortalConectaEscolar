export const CARGOS_GESTAO_EVENTOS = ["gestor", "admin"] as const;

export function podeGerenciarEventos(cargo: string | null | undefined): boolean {
  if (!cargo) return false;
  return (CARGOS_GESTAO_EVENTOS as readonly string[]).includes(cargo);
}
