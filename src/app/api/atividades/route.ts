import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Cliente Supabase server-side (usa service role apenas em servidor)
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
  return createClient(url, key);
}

// Validação de entrada com Zod
const AtividadeSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório").max(200, "Título muito longo"),
  descricao: z.string().max(2000, "Descrição muito longa").optional().default(""),
  status: z.enum(["Pendente", "Em andamento", "Concluído"], {
    errorMap: () => ({ message: "Status inválido" }),
  }),
  arquivo_pdf_url: z.string().url("URL inválida").optional().nullable(),
});

// Headers de segurança
const secHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store",
};

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("atividades")
      .select("id, titulo, descricao, status, arquivo_pdf_url, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ erro: "Falha ao buscar atividades" }, { status: 400, headers: secHeaders });
    }

    return NextResponse.json(data, { status: 200, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno no servidor" }, { status: 500, headers: secHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verifica Content-Type
    const ct = request.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ erro: "Content-Type deve ser application/json" }, { status: 415, headers: secHeaders });
    }

    const body = await request.json();
    const parsed = AtividadeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors },
        { status: 422, headers: secHeaders }
      );
    }

    const { titulo, descricao, status, arquivo_pdf_url } = parsed.data;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("atividades")
      .insert([{ titulo, descricao, status, arquivo_pdf_url }])
      .select("id, titulo, descricao, status, arquivo_pdf_url, created_at");

    if (error) {
      return NextResponse.json({ erro: "Falha ao criar atividade" }, { status: 400, headers: secHeaders });
    }

    return NextResponse.json(data[0], { status: 201, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno no servidor" }, { status: 500, headers: secHeaders });
  }
}
