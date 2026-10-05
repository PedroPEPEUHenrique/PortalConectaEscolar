import { z } from "zod";

export const criarTurmaSchema = z.object({
  nome: z.string().trim().min(1, "Nome da turma obrigatório").max(100),
  descricao: z.string().trim().max(500).default(""),
  ano_letivo: z.string().regex(/^\d{4}$/, "Ano letivo deve ter 4 dígitos"),
});

export const atualizarTurmaSchema = criarTurmaSchema
  .partial()
  .refine((valores) => Object.keys(valores).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const TIPOS_MEMBRO = ["aluno", "professor"] as const;
export type TipoMembro = (typeof TIPOS_MEMBRO)[number];

export const membroSchema = z.object({
  user_id: z.string().uuid(),
  tipo: z.enum(TIPOS_MEMBRO),
});

export const idTurmaSchema = z.string().uuid();

export type CriarTurma = z.infer<typeof criarTurmaSchema>;
export type AtualizarTurma = z.infer<typeof atualizarTurmaSchema>;
export type Membro = z.infer<typeof membroSchema>;

export type MembroTurma = {
  id: string;
  email: string | null;
  nome_completo: string | null;
};

export type TurmaBase = {
  id: string;
  nome: string;
  descricao: string;
  ano_letivo: string;
  created_at: string;
};

export type Turma = TurmaBase & {
  turma_alunos: { aluno_id: string }[];
  turma_professores: { professor_id: string; perfis: MembroTurma | null }[];
};

export type MembrosTurma = {
  professores: MembroTurma[];
  alunos: MembroTurma[];
};
