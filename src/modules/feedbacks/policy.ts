export const CARGOS_LEITURA_FEEDBACKS = ["gestor", "admin"] as const;

export function podeLerFeedbacks(cargo: string | null | undefined): boolean {
  if (!cargo) return false;
  return (CARGOS_LEITURA_FEEDBACKS as readonly string[]).includes(cargo);
}
