import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );
}

const secHeaders = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("feedbacks")
      .select("id, nome, email, tipo, mensagem, created_at")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ erro: "Falha ao buscar feedbacks" }, { status: 400, headers: secHeaders });
    return NextResponse.json(data, { status: 200, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}
