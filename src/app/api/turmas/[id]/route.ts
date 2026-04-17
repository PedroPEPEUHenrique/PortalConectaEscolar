import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );
}

const UpdateSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  descricao: z.string().max(500).optional(),
  ano_letivo: z.string().regex(/^\d{4}$/).optional(),
});

const UUIDSchema = z.string().uuid("ID inválido");
const secHeaders = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = UUIDSchema.safeParse(id);
    if (!idParsed.success) return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: secHeaders });

    const body = await request.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: secHeaders });

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("turmas")
      .update(parsed.data)
      .eq("id", idParsed.data)
      .select("id, nome, descricao, ano_letivo, created_at");

    if (error || !data?.length)
      return NextResponse.json({ erro: "Falha ao atualizar turma" }, { status: 400, headers: secHeaders });

    return NextResponse.json(data[0], { status: 200, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = UUIDSchema.safeParse(id);
    if (!idParsed.success) return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: secHeaders });

    const supabase = getSupabase();
    const { error } = await supabase.from("turmas").delete().eq("id", idParsed.data);

    if (error) return NextResponse.json({ erro: "Falha ao excluir turma" }, { status: 400, headers: secHeaders });
    return NextResponse.json({ mensagem: "Turma excluída com sucesso" }, { status: 200, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}
