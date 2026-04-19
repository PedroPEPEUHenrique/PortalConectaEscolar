import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const TurmaSchema = z.object({
  nome: z.string().min(1).max(100),
  descricao: z.string().max(500).optional().default(""),
  ano_letivo: z.string().regex(/^\d{4}$/, "Ano letivo deve ter 4 dígitos"),
});
const sec = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET() {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("turmas").select(`
    id, nome, descricao, ano_letivo, created_at,
    turma_alunos(count),
    turma_professores(professor_id, perfis(id, email, nome_completo))
  `).order("ano_letivo", { ascending: false }).order("nome", { ascending: true });
  if (error) return NextResponse.json({ erro: "Falha ao buscar turmas" }, { status: 400, headers: sec });
  return NextResponse.json(data, { headers: sec });
}

export async function POST(request: NextRequest) {
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json"))
    return NextResponse.json({ erro: "Content-Type deve ser application/json" }, { status: 415, headers: sec });

  const parsed = TurmaSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: sec });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("turmas").insert([parsed.data])
    .select("id, nome, descricao, ano_letivo, created_at");
  if (error) return NextResponse.json({ erro: "Falha ao criar turma" }, { status: 400, headers: sec });
  return NextResponse.json(data[0], { status: 201, headers: sec });
}
