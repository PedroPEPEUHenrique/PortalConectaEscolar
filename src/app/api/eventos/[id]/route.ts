import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 🟡 PUT: Atualiza (Edita) um evento existente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    
    const { data: dataEvento, evento, tipo } = body;

    const { data, error } = await supabase
      .from("eventos")
      .update({ data: dataEvento, evento, tipo })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    return NextResponse.json(data[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor ao atualizar evento" }, { status: 500 });
  }
}

// 🔴 DELETE: Exclui um evento
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }

    return NextResponse.json({ mensagem: "Evento excluído com sucesso!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno no servidor ao excluir evento" }, { status: 500 });
  }
}