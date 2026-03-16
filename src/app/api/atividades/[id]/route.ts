import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 🟡 FUNÇÃO PUT: Atualiza (Edita) uma atividade existente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Pegamos os novos dados enviados pelo front-end
    const { titulo, descricao, status } = body;

    const { data, error } = await supabase
      .from("atividades")
      .update({ titulo, descricao, status })
      .eq("id", id) // Onde o ID for igual ao que passamos na URL
      .select();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    return NextResponse.json(data[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor ao atualizar" }, { status: 500 });
  }
}

// 🔴 FUNÇÃO DELETE: Exclui uma atividade
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const { error } = await supabase
      .from("atividades")
      .delete()
      .eq("id", id); // Deleta apenas a atividade com esse ID

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    return NextResponse.json({ mensagem: "Atividade excluída com sucesso!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor ao excluir" }, { status: 500 });
  }
}