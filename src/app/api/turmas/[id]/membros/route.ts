import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const UUID = z.string().uuid();
const MembroSchema = z.object({
  user_id: z.string().uuid(),
  tipo: z.enum(["aluno", "professor"]),
});
const sec = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.safeParse(id).success) return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: sec });

  const sb = getSupabaseAdmin();
  const [{ data: profData, error: profErr }, { data: aluData, error: aluErr }] = await Promise.all([
    sb.from("turma_professores").select("professor_id, perfis(id, email, nome_completo)").eq("turma_id", id),
    sb.from("turma_alunos").select("aluno_id, perfis(id, email, nome_completo)").eq("turma_id", id),
  ]);

  if (profErr || aluErr) return NextResponse.json({ erro: "Falha ao buscar membros" }, { status: 400, headers: sec });
  return NextResponse.json({ professores: profData?.map(r => r.perfis) ?? [], alunos: aluData?.map(r => r.perfis) ?? [] }, { headers: sec });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: turma_id } = await params;
  if (!UUID.safeParse(turma_id).success) return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: sec });

  const parsed = MembroSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: sec });

  const { user_id, tipo } = parsed.data;
  const sb = getSupabaseAdmin();

  if (tipo === "aluno") {
    await sb.from("turma_alunos").delete().eq("aluno_id", user_id);
    const { error } = await sb.from("turma_alunos").insert({ turma_id, aluno_id: user_id });
    if (error) return NextResponse.json({ erro: "Falha ao adicionar aluno" }, { status: 400, headers: sec });
  } else {
    const { error } = await sb.from("turma_professores").insert({ turma_id, professor_id: user_id });
    if (error) return NextResponse.json({ erro: "Falha ao adicionar professor" }, { status: 400, headers: sec });
  }
  return NextResponse.json({ mensagem: "Membro adicionado" }, { status: 201, headers: sec });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: turma_id } = await params;
  if (!UUID.safeParse(turma_id).success) return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: sec });

  const parsed = MembroSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: sec });

  const { user_id, tipo } = parsed.data;
  const sb = getSupabaseAdmin();

  const { error } = tipo === "aluno"
    ? await sb.from("turma_alunos").delete().eq("turma_id", turma_id).eq("aluno_id", user_id)
    : await sb.from("turma_professores").delete().eq("turma_id", turma_id).eq("professor_id", user_id);

  if (error) return NextResponse.json({ erro: "Falha ao remover membro" }, { status: 400, headers: sec });
  return NextResponse.json({ mensagem: "Membro removido" }, { headers: sec });
}
