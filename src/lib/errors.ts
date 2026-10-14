export type CodigoErro =
  | "VALIDACAO"
  | "CORPO_GRANDE"
  | "LIMITE_EXCEDIDO"
  | "ORIGEM_NAO_PERMITIDA"
  | "NAO_AUTENTICADO"
  | "NAO_AUTORIZADO"
  | "NAO_ENCONTRADO"
  | "CONFLITO"
  | "ERRO_INTERNO";

export type DetalhesValidacao = Record<string, string[] | undefined>;

type OpcoesErro = {
  detalhes?: DetalhesValidacao;
  causa?: unknown;
  cabecalhos?: Record<string, string>;
};

export class AppError extends Error {
  readonly codigo: CodigoErro;
  readonly status: number;
  readonly detalhes?: DetalhesValidacao;
  readonly causa?: unknown;
  readonly cabecalhos?: Record<string, string>;

  constructor(codigo: CodigoErro, status: number, mensagem: string, opcoes: OpcoesErro = {}) {
    super(mensagem);
    this.name = this.constructor.name;
    this.codigo = codigo;
    this.status = status;
    this.detalhes = opcoes.detalhes;
    this.causa = opcoes.causa;
    this.cabecalhos = opcoes.cabecalhos;
  }
}

export class ErroValidacao extends AppError {
  constructor(mensagem = "Dados inválidos", opcoes: OpcoesErro = {}) {
    super("VALIDACAO", 422, mensagem, opcoes);
  }
}

export class ErroCorpoGrande extends AppError {
  constructor(mensagem = "Corpo da requisição excede o tamanho permitido", opcoes: OpcoesErro = {}) {
    super("CORPO_GRANDE", 413, mensagem, opcoes);
  }
}

export class ErroLimiteExcedido extends AppError {
  readonly repetirAposSegundos: number;

  constructor(
    repetirAposSegundos: number,
    mensagem = "Muitas requisições. Aguarde antes de tentar novamente."
  ) {
    super("LIMITE_EXCEDIDO", 429, mensagem, {
      cabecalhos: { "Retry-After": String(repetirAposSegundos) },
    });
    this.repetirAposSegundos = repetirAposSegundos;
  }
}

export class ErroOrigemNaoPermitida extends AppError {
  constructor(
    mensagem = "Requisição bloqueada: origem não permitida",
    opcoes: OpcoesErro = {}
  ) {
    super("ORIGEM_NAO_PERMITIDA", 403, mensagem, opcoes);
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
