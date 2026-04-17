import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );
}

const CargoQuery = z.enum(["aluno", "professor", "gestor", "admin"]);
const secHeaders = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  try {
    const cargo = request.nextUrl.searchParams.get("cargo");
    const supabase = getSupabase();

    let query = supabase.from("perfis").select("id, email, nome_completo, cargo");
    if (cargo) {
      const parsed = CargoQuery.safeParse(cargo);
      if (!parsed.success)
        return NextResponse.json({ erro: "Cargo inválido" }, { status: 422, headers: secHeaders });
      query = query.eq("cargo", parsed.data);
    }

    const { data, error } = await query.order("email", { ascending: true });
    if (error) return NextResponse.json({ erro: "Falha ao buscar usuários" }, { status: 400, headers: secHeaders });
    return NextResponse.json(data, { status: 200, headers: secHeaders });
  } catch {
    return NextResponse.json({ erro: "Erro interno" }, { status: 500, headers: secHeaders });
  }
}
