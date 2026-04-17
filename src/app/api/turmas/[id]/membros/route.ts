import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );
}

const UUIDSchema = z.string().uuid("ID inválido");
const MembroSchema = z.object({
  user_id: z.string().uuid("user_id inválido"),
  tipo: z.enum(["aluno", "professor"]),
});

const secHeaders = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!UUIDSchema.safeParse(id).success)
      return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: secHeaders });

    const supabase = getSupabase();

    const [{ data: profData, error: profErr }, { data: aluData, error: aluErr }] = await Promise.all([
      supabase
        .from("turma_professores")
        .select("professor_id, perfis(id, email, nome_completo)")
        .eq("turma_id", id),
      supabase
        .from("turma_alunos")
        .select("aluno_id, perfis(id, email, nome_completo)")
        .eq("turma_id", id),
    ]);

    if (profErr || aluErr)
      return NextResponse.json({ erro: "Falha ao buscar membros" }, { status: 400, headers: secHeaders });

    return NextResponse.json(
      {
        professores: profData?.map((r) => r.perfis) ?? [],
        alunos: aluData?.map((r) => r.perfis) ?? [],
      },
      { status: 200, headers: secHeaders }
    );
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: turma_id } = await params;
    if (!UUIDSchema.safeParse(turma_id).success)
      return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: secHeaders });

    const body = await request.json();
    const parsed = MembroSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: secHeaders });

    const { user_id, tipo } = parsed.data;
    const supabase = getSupabase();

    if (tipo === "aluno") {
      // Remove de outra turma se existir (UNIQUE garante 1 turma por aluno)
      await supabase.from("turma_alunos").delete().eq("aluno_id", user_id);
      const { error } = await supabase.from("turma_alunos").insert({ turma_id, aluno_id: user_id });
      if (error) return NextResponse.json({ erro: "Falha ao adicionar aluno" }, { status: 400, headers: secHeaders });
    } else {
      const { error } = await supabase
        .from("turma_professores")
        .insert({ turma_id, professor_id: user_id });
      if (error) return NextResponse.json({ erro: "Falha ao adicionar professor" }, { status: 400, headers: secHeaders });
    }

    return NextResponse.json({ mensagem: "Membro adicionado com sucesso" }, { status: 201, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: turma_id } = await params;
    if (!UUIDSchema.safeParse(turma_id).success)
      return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: secHeaders });

    const body = await request.json();
    const parsed = MembroSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: secHeaders });

    const { user_id, tipo } = parsed.data;
    const supabase = getSupabase();

    if (tipo === "aluno") {
      const { error } = await supabase
        .from("turma_alunos")
        .delete()
        .eq("turma_id", turma_id)
        .eq("aluno_id", user_id);
      if (error) return NextResponse.json({ erro: "Falha ao remover aluno" }, { status: 400, headers: secHeaders });
    } else {
      const { error } = await supabase
        .from("turma_professores")
        .delete()
        .eq("turma_id", turma_id)
        .eq("professor_id", user_id);
      if (error) return NextResponse.json({ erro: "Falha ao remover professor" }, { status: 400, headers: secHeaders });
    }

    return NextResponse.json({ mensagem: "Membro removido com sucesso" }, { status: 200, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}
