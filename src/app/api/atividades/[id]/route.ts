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
  titulo: z.string().min(1).max(200).optional(),
  descricao: z.string().max(2000).optional(),
  status: z.enum(["Pendente", "Em andamento", "Concluído"]).optional(),
});

const UUIDSchema = z.string().uuid("ID inválido");

const secHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
};

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idParsed = UUIDSchema.safeParse(params.id);
    if (!idParsed.success) {
      return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: secHeaders });
    }

    const body = await request.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: secHeaders });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("atividades")
      .update(parsed.data)
      .eq("id", idParsed.data)
      .select("id, titulo, descricao, status, created_at");

    if (error || !data?.length) {
      return NextResponse.json({ erro: "Falha ao atualizar atividade" }, { status: 400, headers: secHeaders });
    }

    return NextResponse.json(data[0], { status: 200, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno no servidor" }, { status: 500, headers: secHeaders });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idParsed = UUIDSchema.safeParse(params.id);
    if (!idParsed.success) {
      return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: secHeaders });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("atividades")
      .delete()
      .eq("id", idParsed.data);

    if (error) {
      return NextResponse.json({ erro: "Falha ao excluir atividade" }, { status: 400, headers: secHeaders });
    }

    return NextResponse.json({ mensagem: "Atividade excluída com sucesso" }, { status: 200, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno no servidor" }, { status: 500, headers: secHeaders });
  }
}
