"use client";

import { useState, useRef, useEffect } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";

const PALETAS: Record<string, { primary: string; bg: string }> = {
  padrao:                      { primary: "#00c77a", bg: "#111827" },
  "daltonismo-verde-vermelho": { primary: "#ffd700", bg: "#111827" },
  monocromatico:               { primary: "#ffffff", bg: "#1a1a1a" },
  "alto-contraste":            { primary: "#ffff00", bg: "#111111" },
};

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const {
    fontSizeModifier,
    aumentarFonte,
    diminuirFonte,
    resetarFonte,
    colorMode,
    setColorMode,
    resetarTudo,
  } = useAccessibility();

  const { primary: cor, bg: bgPanel } = PALETAS[colorMode] ?? PALETAS.padrao;
  const pct = Math.round((fontSizeModifier / 14) * 100);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const colorOptions: { value: Parameters<typeof setColorMode>[0]; label: string; desc: string }[] = [
    { value: "padrao",                      label: "Padrão",        desc: "Verde/Azul" },
    { value: "daltonismo-verde-vermelho",   label: "Deuteranopia",  desc: "Amarelo/Azul" },
    { value: "monocromatico",              label: "Monocromático", desc: "Preto/Branco" },
    { value: "alto-contraste",             label: "Alto Contraste",desc: "Amarelo/Preto" },
  ];

  return (
    <>
      <style>{`
        .reduce-motion * { transition: none !important; animation: none !important; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .a11y-panel { animation: slideUp 0.2s ease; }

        .color-chip {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          color: white;
          font-family: inherit;
          font-size: 0.8rem;
          width: 100%;
        }
        .color-chip:hover { border-color: ${cor}66; background: ${cor}10; }
        .color-chip.selected { border-color: ${cor}; background: ${cor}20; }

        .font-btn {
          width: 38px; height: 38px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: white;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
          font-family: inherit;
        }
        .font-btn:hover:not(:disabled) { background: ${cor}25; border-color: ${cor}66; }
        .font-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .a11y-fab {
          position: fixed;
          bottom: 28px; right: 28px;
          width: 54px; height: 54px;
          border-radius: 50%;
          background: ${cor};
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px ${cor}55;
          transition: transform 0.2s, box-shadow 0.2s;
          z-index: 9999;
          color: #0f172a;
        }
        .a11y-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px ${cor}80; }
        .a11y-fab:focus-visible { outline: 3px solid white; outline-offset: 3px; }
      `}</style>

      {/* Botão FAB */}
      <button
        ref={btnRef}
        className="a11y-fab"
        onClick={() => setOpen((p) => !p)}
        aria-label="Opções de Acessibilidade"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6c1.1 0 2 .9 2 2v4l1.5 3H16v1h-4v-1h.5l-1-2.5V14h-1v3.5L9.5 20H10v1H6v-1h.5L8 17V10c0-1.1.9-2 2-2z"/>
        </svg>
      </button>

      {/* Painel */}
      {open && (
        <div
          ref={panelRef}
          className="a11y-panel"
          role="dialog"
          aria-label="Painel de Acessibilidade"
          style={{
            position: "fixed",
            bottom: 94,
            right: 28,
            width: 320,
            background: bgPanel,
            border: `1px solid ${cor}30`,
            borderRadius: 16,
            padding: 20,
            zIndex: 9998,
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            color: "white",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
          }}
        >
          {/* Cabeçalho */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: cor }}>
                Acessibilidade
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                Preferências salvas automaticamente
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar painel"
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: 4, borderRadius: 6 }}
            >
              ✕
            </button>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "0 0 16px" }} />

          {/* Tamanho da Fonte */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Tamanho do Texto
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="font-btn" onClick={diminuirFonte} disabled={fontSizeModifier <= 12} aria-label="Diminuir fonte">A−</button>
              <div style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: "0.9rem", background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "8px 0" }}>
                {pct}%
              </div>
              <button className="font-btn" onClick={aumentarFonte} disabled={fontSizeModifier >= 22} aria-label="Aumentar fonte">A+</button>
              <button className="font-btn" onClick={resetarFonte} aria-label="Resetar fonte" title="Resetar">↺</button>
            </div>
          </div>

          {/* Esquema de Cores */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Esquema de Cores
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`color-chip ${colorMode === opt.value ? "selected" : ""}`}
                  onClick={() => setColorMode(opt.value)}
                  aria-pressed={colorMode === opt.value}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{opt.label}</div>
                  <div style={{ fontSize: "0.72rem", opacity: 0.55, marginTop: 2 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reset geral */}
          <button
            onClick={() => { resetarTudo(); setOpen(false); }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,80,80,0.1)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,80,80,0.3)";
              (e.currentTarget as HTMLButtonElement).style.color = "#ff8080";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
            }}
          >
            Restaurar configurações padrão
          </button>
        </div>
      )}
    </>
  );
}
