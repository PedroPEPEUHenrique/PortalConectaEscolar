import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const EventoSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser YYYY-MM-DD"),
  evento: z.string().min(1).max(300),
  tipo: z.string().max(50).optional().default("geral"),
});
const sec = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET() {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("eventos")
    .select("id, data, evento, tipo, created_at")
    .order("data", { ascending: true }).limit(500);
  if (error) return NextResponse.json({ erro: "Falha ao buscar eventos" }, { status: 400, headers: sec });
  return NextResponse.json(data, { headers: sec });
}

export async function POST(request: NextRequest) {
  const parsed = EventoSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422, headers: sec });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("eventos").insert([parsed.data])
    .select("id, data, evento, tipo, created_at");
  if (error) return NextResponse.json({ erro: "Falha ao criar evento" }, { status: 400, headers: sec });
  return NextResponse.json(data[0], { status: 201, headers: sec });
}
