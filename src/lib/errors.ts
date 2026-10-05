export type CodigoErro =
  | "VALIDACAO"
  | "NAO_AUTENTICADO"
  | "NAO_AUTORIZADO"
  | "NAO_ENCONTRADO"
  | "CONFLITO"
  | "ERRO_INTERNO";

export type DetalhesValidacao = Record<string, string[] | undefined>;

type OpcoesErro = {
  detalhes?: DetalhesValidacao;
  causa?: unknown;
};

export class AppError extends Error {
  readonly codigo: CodigoErro;
  readonly status: number;
  readonly detalhes?: DetalhesValidacao;
  readonly causa?: unknown;

  constructor(codigo: CodigoErro, status: number, mensagem: string, opcoes: OpcoesErro = {}) {
    super(mensagem);
    this.name = this.constructor.name;
    this.codigo = codigo;
    this.status = status;
    this.detalhes = opcoes.detalhes;
    this.causa = opcoes.causa;
  }
}

export class ErroValidacao extends AppError {
  constructor(mensagem = "Dados inválidos", opcoes: OpcoesErro = {}) {
    super("VALIDACAO", 422, mensagem, opcoes);
  }
}

export class ErroNaoAutenticado extends AppError {
  constructor(mensagem = "Autenticação obrigatória", opcoes: OpcoesErro = {}) {
    super("NAO_AUTENTICADO", 401, mensagem, opcoes);
  }
}

export class ErroNaoAutorizado extends AppError {
  constructor(mensagem = "Você não tem permissão para esta operação", opcoes: OpcoesErro = {}) {
    super("NAO_AUTORIZADO", 403, mensagem, opcoes);
  }
}

export class ErroNaoEncontrado extends AppError {
  constructor(mensagem = "Registro não encontrado", opcoes: OpcoesErro = {}) {
    super("NAO_ENCONTRADO", 404, mensagem, opcoes);
  }
}

export class ErroConflito extends AppError {
  constructor(mensagem = "Conflito com um registro existente", opcoes: OpcoesErro = {}) {
    super("CONFLITO", 409, mensagem, opcoes);
  }
}

export class ErroInterno extends AppError {
  constructor(mensagem = "Erro interno do servidor", opcoes: OpcoesErro = {}) {
    super("ERRO_INTERNO", 500, mensagem, opcoes);
  }
}

export type ErroBanco = {
  code?: string;
  message?: string;
  details?: string | null;
};

export function mapearErroBanco(erro: ErroBanco, mensagemFallback: string): AppError {
  switch (erro.code) {
    case "23505":
      return new ErroConflito("Este registro já existe", { causa: erro });
    case "23503":
      return new ErroValidacao("Referência inválida: o registro relacionado não existe", { causa: erro });
    case "23514":
      return new ErroValidacao("Valor fora do permitido para um dos campos", { causa: erro });
    case "PGRST116":
      return new ErroNaoEncontrado("Registro não encontrado", { causa: erro });
    default:
      return new ErroInterno(mensagemFallback, { causa: erro });
  }
}
