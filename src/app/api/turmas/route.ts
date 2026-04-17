import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );
}

const TurmaSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(100, "Nome muito longo"),
  descricao: z.string().max(500, "Descrição muito longa").optional().default(""),
  ano_letivo: z.string().regex(/^\d{4}$/, "Ano letivo deve ter 4 dígitos"),
});

const secHeaders = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("turmas")
      .select(`
        id, nome, descricao, ano_letivo, created_at,
        turma_alunos(count),
        turma_professores(professor_id, perfis(id, email, nome_completo))
      `)
      .order("ano_letivo", { ascending: false })
      .order("nome", { ascending: true });

    if (error) return NextResponse.json({ erro: "Falha ao buscar turmas" }, { status: 400, headers: secHeaders });
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
    const parsed = TurmaSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: secHeaders });

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("turmas")
      .insert([parsed.data])
      .select("id, nome, descricao, ano_letivo, created_at");

    if (error) return NextResponse.json({ erro: "Falha ao criar turma" }, { status: 400, headers: secHeaders });
    return NextResponse.json(data[0], { status: 201, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}
