import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const UpdateSchema = z.object({
  autor: z.string().min(1).max(100).optional(),
  mensagem: z.string().min(1).max(1000).optional(),
});
const ID = z.string().min(1);
const sec = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID.safeParse(id).success) return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: sec });

  const parsed = UpdateSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: sec });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("comunidade").update(parsed.data).eq("id", id)
    .select("id, autor, mensagem, created_at");
  if (error || !data?.length) return NextResponse.json({ erro: "Falha ao atualizar" }, { status: 400, headers: sec });
  return NextResponse.json(data[0], { headers: sec });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID.safeParse(id).success) return NextResponse.json({ erro: "ID inválido" }, { status: 400, headers: sec });

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("comunidade").delete().eq("id", id);
  if (error) return NextResponse.json({ erro: "Falha ao excluir" }, { status: 400, headers: sec });
  return NextResponse.json({ mensagem: "Excluído com sucesso" }, { headers: sec });
}
