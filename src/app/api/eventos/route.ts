import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );
}

const EventoSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser YYYY-MM-DD"),
  evento: z.string().min(1, "Nome do evento obrigatório").max(300),
  tipo: z.string().max(50).optional().default("geral"),
});

const secHeaders = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("eventos")
      .select("id, data, evento, tipo, created_at")
      .order("data", { ascending: true })
      .limit(500);

    if (error) return NextResponse.json({ erro: "Falha ao buscar eventos" }, { status: 400, headers: secHeaders });
    return NextResponse.json(data, { status: 200, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = EventoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: secHeaders });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("eventos")
      .insert([parsed.data])
      .select("id, data, evento, tipo, created_at");

    if (error) return NextResponse.json({ erro: "Falha ao criar evento" }, { status: 400, headers: secHeaders });
    return NextResponse.json(data[0], { status: 201, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}
