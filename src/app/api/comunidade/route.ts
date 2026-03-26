import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );
}

const PostSchema = z.object({
  autor: z.string().min(1, "Autor obrigatório").max(100, "Nome do autor muito longo"),
  mensagem: z.string().min(1, "Mensagem obrigatória").max(1000, "Mensagem muito longa"),
});

const secHeaders = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("comunidade")
      .select("id, autor, mensagem, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return NextResponse.json({ erro: "Falha ao buscar avisos" }, { status: 400, headers: secHeaders });
    return NextResponse.json(data, { status: 200, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ct = request.headers.get("content-type") ?? "";
    if (!ct.includes("application/json"))
      return NextResponse.json({ erro: "Content-Type deve ser application/json" }, { status: 415, headers: secHeaders });

    const body = await request.json();
    const parsed = PostSchema.safeParse(body);

    if (!parsed.success)
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: secHeaders });

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("comunidade")
      .insert([parsed.data])
      .select("id, autor, mensagem, created_at");

    if (error) return NextResponse.json({ erro: "Falha ao criar aviso" }, { status: 400, headers: secHeaders });
    return NextResponse.json(data[0], { status: 201, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}
