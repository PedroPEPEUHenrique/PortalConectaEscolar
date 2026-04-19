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
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("feedbacks")
    .select("id, nome, email, tipo, mensagem, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ erro: "Falha ao buscar feedbacks" }, { status: 400, headers: sec });
  return NextResponse.json(data, { headers: sec });
}

export async function POST(request: NextRequest) {
  const parsed = FeedbackSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: sec });

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("feedbacks").insert([parsed.data]);
  if (error) return NextResponse.json({ erro: "Falha ao enviar feedback" }, { status: 400, headers: sec });
  return NextResponse.json({ mensagem: "Feedback enviado com sucesso" }, { status: 201, headers: sec });
}
