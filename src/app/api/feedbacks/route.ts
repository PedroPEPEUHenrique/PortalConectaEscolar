import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const FeedbackSchema = z.object({
  nome: z.string().min(1).max(100),
  email: z.string().email().max(254),
  tipo: z.enum(["Elogio", "Sugestão", "Reclamação", "Problema Técnico"]),
  mensagem: z.string().min(1).max(2000),
});

const sec = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET() {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("feedbacks")
      .select("id, nome, email, tipo, mensagem, created_at")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ erro: "Falha ao buscar feedbacks" }, { status: 400, headers: sec });
    return NextResponse.json(data, { headers: sec });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ erro: msg }, { status: 500, headers: sec });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ erro: "Corpo inválido" }, { status: 400, headers: sec });

    const parsed = FeedbackSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: sec });

    const sb = getSupabaseAdmin();
    const { error } = await sb.from("feedbacks").insert([parsed.data]);
    if (error) return NextResponse.json({ erro: "Falha ao enviar feedback: " + error.message }, { status: 400, headers: sec });
    return NextResponse.json({ mensagem: "Feedback enviado com sucesso" }, { status: 201, headers: sec });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ erro: msg }, { status: 500, headers: sec });
  }
}
