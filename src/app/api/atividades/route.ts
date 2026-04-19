import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const AtividadeSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório").max(200),
  descricao: z.string().max(2000).optional().default(""),
  status: z.enum(["Pendente", "Em andamento", "Concluído"]),
  arquivo_pdf_url: z.string().url().optional().nullable(),
});

const sec = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET() {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("atividades")
      .select("id, titulo, descricao, status, arquivo_pdf_url, created_at")
      .order("created_at", { ascending: false }).limit(200);
    if (error) return NextResponse.json({ erro: "Falha ao buscar atividades: " + error.message }, { status: 400, headers: sec });
    return NextResponse.json(data, { headers: sec });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ erro: msg }, { status: 500, headers: sec });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ct = request.headers.get("content-type") ?? "";
    if (!ct.includes("application/json"))
      return NextResponse.json({ erro: "Content-Type deve ser application/json" }, { status: 415, headers: sec });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ erro: "Corpo inválido" }, { status: 400, headers: sec });

    const parsed = AtividadeSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: sec });

    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("atividades")
      .insert([parsed.data])
      .select("id, titulo, descricao, status, arquivo_pdf_url, created_at");
    if (error) return NextResponse.json({ erro: "Falha ao criar atividade: " + error.message }, { status: 400, headers: sec });
    return NextResponse.json(data[0], { status: 201, headers: sec });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ erro: msg }, { status: 500, headers: sec });
  }
}
