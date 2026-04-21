"use client";

/**
 * Link de acessibilidade que fica oculto até receber foco via teclado.
 * Permite que usuários de teclado/leitor de tela pulem direto para o conteúdo
 * principal, ignorando a barra de navegação.
 */
export default function SkipLink() {
  return (
    <a
      href="#conteudo-principal"
      style={{
        position: "absolute",
        top: "-100px",
        left: 0,
        background: "#22c55e",
        color: "#0f172a",
        padding: "10px 20px",
        fontWeight: 700,
        zIndex: 99999,
        borderRadius: "0 0 6px 0",
        transition: "top 0.2s",
        textDecoration: "none",
      }}
      onFocus={(e) => { e.currentTarget.style.top = "0"; }}
      onBlur={(e)  => { e.currentTarget.style.top = "-100px"; }}
    >
      Pular para o conteúdo principal
    </a>
  );
}
