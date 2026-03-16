import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// FUNÇÃO GET: Busca as atividades no banco (Mantida intacta)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("atividades")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor" }, { status: 500 });
  }
}

// FUNÇÃO POST: Cria uma nova atividade
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // NOVO: Adicionamos o arquivo_pdf_url aqui para receber do Front-end
    const { titulo, descricao, status, arquivo_pdf_url } = body;

    const { data, error } = await supabase
      .from("atividades")
      .insert([
        // NOVO: Inserimos o arquivo_pdf_url na tabela
        { titulo, descricao, status, arquivo_pdf_url }
      ])
      .select();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    // Retorna a atividade recém-criada
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor" }, { status: 500 });
  }
}