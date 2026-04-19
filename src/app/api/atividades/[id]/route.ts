import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const UpdateSchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  descricao: z.string().max(2000).optional(),
  status: z.enum(["Pendente", "Em andamento", "Concluído"]).optional(),
  arquivo_pdf_url: z.string().url().optional().nullable(),
});
const ID = z.string().min(1);
const sec = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ID.safeParse(id).success) return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: sec });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ erro: "Corpo inválido" }, { status: 400, headers: sec });

    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: sec });

    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("atividades").update(parsed.data).eq("id", id)
      .select("id, titulo, descricao, status, arquivo_pdf_url, created_at");
    if (error || !data?.length) return NextResponse.json({ erro: "Falha ao atualizar: " + (error?.message ?? "não encontrado") }, { status: 400, headers: sec });
    return NextResponse.json(data[0], { headers: sec });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ erro: msg }, { status: 500, headers: sec });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ID.safeParse(id).success) return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: sec });

    const sb = getSupabaseAdmin();
    const { error } = await sb.from("atividades").delete().eq("id", id);
    if (error) return NextResponse.json({ erro: "Falha ao excluir: " + error.message }, { status: 400, headers: sec });
    return NextResponse.json({ mensagem: "Excluído com sucesso" }, { headers: sec });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ erro: msg }, { status: 500, headers: sec });
  }
}
