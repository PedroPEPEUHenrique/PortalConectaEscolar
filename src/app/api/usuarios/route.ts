import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const CargoQuery = z.enum(["aluno", "professor", "gestor", "admin"]);
const sec = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const cargo = request.nextUrl.searchParams.get("cargo");
  const sb = getSupabaseAdmin();

  let query = sb.from("perfis").select("id, email, nome_completo, cargo");
  if (cargo) {
    const parsed = CargoQuery.safeParse(cargo);
    if (!parsed.success)
      return NextResponse.json({ erro: "Cargo inválido" }, { status: 422, headers: sec });
    query = query.eq("cargo", parsed.data);
  }

  const { data, error } = await query.order("email", { ascending: true });
  if (error) return NextResponse.json({ erro: "Falha ao buscar usuários" }, { status: 400, headers: sec });
  return NextResponse.json(data, { headers: sec });
}
