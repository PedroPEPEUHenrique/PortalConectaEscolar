import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 🟢 GET: Busca todos os avisos da comunidade
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("comunidade")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor ao buscar posts" }, { status: 500 });
  }
}

// 🔵 POST: Cria um novo aviso na comunidade
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extraímos os campos que o front-end envia
    const { autor, mensagem } = body;

    const { data, error } = await supabase
      .from("comunidade")
      .insert([
        { autor, mensagem }
      ])
      .select();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor ao criar post" }, { status: 500 });
  }
}