import type { Atividade, AtualizarAtividade, CriarAtividade } from "@/modules/atividades/schema";
import type { Aviso, AtualizarAviso, CriarAviso } from "@/modules/comunidade/schema";
import type { AtualizarEvento, CriarEvento, Evento } from "@/modules/eventos/schema";
import type { CriarFeedback, Feedback } from "@/modules/feedbacks/schema";
import type { Cargo, Perfil } from "@/modules/perfis/schema";
import type {
  AtualizarTurma,
  CriarTurma,
  Membro,
  MembrosTurma,
  Turma,
  TurmaBase,
} from "@/modules/turmas/schema";
import type { DetalhesValidacao } from "./errors";

export class ErroApi extends Error {
  readonly status: number;
  readonly detalhes?: DetalhesValidacao;
  readonly repetirApos?: number;

  constructor(
    mensagem: string,
    status: number,
    detalhes?: DetalhesValidacao,
    repetirApos?: number
  ) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
    this.detalhes = detalhes;
    this.repetirApos = repetirApos;
  }

  get excedeuLimite(): boolean {
    return this.status === 429;
  }
}

export function mensagemDeErro(erro: unknown, padrao: string): string {
  return erro instanceof ErroApi ? erro.message : padrao;
}

async function requisitar<T>(url: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(url, { cache: "no-store", ...init });

  const corpo: unknown = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const dados = (corpo ?? {}) as {
      erro?: unknown;
      detalhes?: DetalhesValidacao;
      repetirApos?: unknown;
    };
    const mensagem =
      typeof dados.erro === "string" ? dados.erro : "Erro " + resposta.status + " na requisição";
    const repetirApos =
      typeof dados.repetirApos === "number" ? dados.repetirApos : undefined;

    throw new ErroApi(mensagem, resposta.status, dados.detalhes, repetirApos);
  }

  return corpo as T;
}

function comJson(metodo: "POST" | "PUT" | "DELETE", dados: unknown): RequestInit {
  return {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  };
}

export const api = {
  atividades: {
    listar: () => requisitar<Atividade[]>("/api/atividades"),
    criar: (dados: CriarAtividade) =>
      requisitar<Atividade>("/api/atividades", comJson("POST", dados)),
    atualizar: (id: string, dados: AtualizarAtividade) =>
      requisitar<Atividade>("/api/atividades/" + id, comJson("PUT", dados)),
    excluir: (id: string) =>
      requisitar<{ mensagem: string }>("/api/atividades/" + id, { method: "DELETE" }),
    enviarPdf: (arquivo: File) => {
      const form = new FormData();
      form.append("arquivo", arquivo);
      return requisitar<{ url: string }>("/api/atividades/upload", {
        method: "POST",
        body: form,
      });
    },
  },

  eventos: {
    listar: () => requisitar<Evento[]>("/api/eventos"),
    criar: (dados: CriarEvento) => requisitar<Evento>("/api/eventos", comJson("POST", dados)),
    atualizar: (id: string, dados: AtualizarEvento) =>
      requisitar<Evento>("/api/eventos/" + id, comJson("PUT", dados)),
    excluir: (id: string) =>
      requisitar<{ mensagem: string }>("/api/eventos/" + id, { method: "DELETE" }),
  },

  comunidade: {
    listar: () => requisitar<Aviso[]>("/api/comunidade"),
    criar: (dados: CriarAviso) => requisitar<Aviso>("/api/comunidade", comJson("POST", dados)),
    atualizar: (id: string, dados: AtualizarAviso) =>
      requisitar<Aviso>("/api/comunidade/" + id, comJson("PUT", dados)),
    excluir: (id: string) =>
      requisitar<{ mensagem: string }>("/api/comunidade/" + id, { method: "DELETE" }),
  },

  feedbacks: {
    listar: () => requisitar<Feedback[]>("/api/feedbacks"),
    enviar: (dados: CriarFeedback) =>
      requisitar<{ mensagem: string }>("/api/feedbacks", comJson("POST", dados)),
  },

  turmas: {
    listar: () => requisitar<Turma[]>("/api/turmas"),
    criar: (dados: CriarTurma) => requisitar<TurmaBase>("/api/turmas", comJson("POST", dados)),
    atualizar: (id: string, dados: AtualizarTurma) =>
      requisitar<TurmaBase>("/api/turmas/" + id, comJson("PUT", dados)),
    excluir: (id: string) =>
      requisitar<{ mensagem: string }>("/api/turmas/" + id, { method: "DELETE" }),
    listarMembros: (turmaId: string) =>
      requisitar<MembrosTurma>("/api/turmas/" + turmaId + "/membros"),
    adicionarMembro: (turmaId: string, membro: Membro) =>
      requisitar<{ mensagem: string }>(
        "/api/turmas/" + turmaId + "/membros",
        comJson("POST", membro)
      ),
    removerMembro: (turmaId: string, membro: Membro) =>
      requisitar<{ mensagem: string }>(
        "/api/turmas/" + turmaId + "/membros",
        comJson("DELETE", membro)
      ),
  },

  usuarios: {
    listar: (cargo?: Cargo) =>
      requisitar<Perfil[]>("/api/usuarios" + (cargo ? "?cargo=" + cargo : "")),
  },
};
