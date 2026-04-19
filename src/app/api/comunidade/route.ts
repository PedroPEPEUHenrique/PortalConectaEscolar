import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const PostSchema = z.object({
  autor: z.string().min(1).max(100),
  mensagem: z.string().min(1).max(1000),
});
const sec = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET() {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("comunidade")
    .select("id, autor, mensagem, created_at")
    .order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ erro: "Falha ao buscar avisos" }, { status: 400, headers: sec });
  return NextResponse.json(data, { headers: sec });
}

export async function POST(request: NextRequest) {
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json"))
    return NextResponse.json({ erro: "Content-Type deve ser application/json" }, { status: 415, headers: sec });

  const parsed = PostSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: sec });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("comunidade").insert([parsed.data])
    .select("id, autor, mensagem, created_at");
  if (error) return NextResponse.json({ erro: "Falha ao criar aviso" }, { status: 400, headers: sec });
  return NextResponse.json(data[0], { status: 201, headers: sec });
}
