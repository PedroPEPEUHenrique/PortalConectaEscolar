export const CARGOS_GESTAO_ATIVIDADES = ["professor", "admin"] as const;

export function podeGerenciarAtividades(cargo: string | null | undefined): boolean {
  if (!cargo) return false;
  return (CARGOS_GESTAO_ATIVIDADES as readonly string[]).includes(cargo);
}
