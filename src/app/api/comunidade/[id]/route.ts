import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 🟡 PUT: Atualiza (Edita) um aviso existente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Pegamos os novos dados enviados pelo front-end
    const { autor, mensagem } = body;

    const { data, error } = await supabase
      .from("comunidade")
      .update({ autor, mensagem })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    return NextResponse.json(data[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor ao atualizar post" }, { status: 500 });
  }
}

// 🔴 DELETE: Exclui um aviso
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const { error } = await supabase
      .from("comunidade")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    return NextResponse.json({ mensagem: "Aviso excluído com sucesso!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor ao excluir post" }, { status: 500 });
  }
}