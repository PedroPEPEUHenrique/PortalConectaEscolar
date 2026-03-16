import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 🟢 GET: Busca todos os eventos do calendário
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor ao buscar eventos" }, { status: 500 });
  }
}

// 🔵 POST: Cria um novo evento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Usamos "dataEvento" como apelido para não confundir com o "data" do Supabase
    const { data: dataEvento, evento, tipo } = body;

    const { data, error } = await supabase
      .from("eventos")
      .insert([
        { data: dataEvento, evento, tipo }
      ])
      .select();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor ao criar evento" }, { status: 500 });
  }
}