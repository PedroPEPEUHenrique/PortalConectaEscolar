"use client";

import {
  createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode,
} from "react";

type ToastTipo = "success" | "error";

type Toast = {
  id:       number;
  mensagem: string;
  tipo:     ToastTipo;
};

type ToastContextType = {
  /** Exibe um pop-up positivo (verde) por 3 segundos no canto superior direito */
  notificarSucesso: (mensagem: string) => void;
  /** Exibe um pop-up negativo (vermelho) por 3 segundos no canto superior direito */
  notificarErro:    (mensagem: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DURACAO_MS = 3000;

const CORES: Record<ToastTipo, { bg: string; border: string; icon: string }> = {
  success: { bg: "#16a34a", border: "#15803d", icon: "✓" },
  error:   { bg: "#dc2626", border: "#b91c1c", icon: "!" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remover = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const adicionar = useCallback((mensagem: string, tipo: ToastTipo) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => remover(id), DURACAO_MS);
  }, [remover]);

  const notificarSucesso = useCallback(
    (mensagem: string) => adicionar(mensagem, "success"),
    [adicionar]
  );
  const notificarErro = useCallback(
    (mensagem: string) => adicionar(mensagem, "error"),
    [adicionar]
  );

  const value = useMemo<ToastContextType>(
    () => ({ notificarSucesso, notificarErro }),
    [notificarSucesso, notificarErro]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position:      "fixed",
          top:           24,
          right:         24,
          zIndex:        10000,
          display:       "flex",
          flexDirection: "column",
          gap:           10,
          pointerEvents: "none",
          maxWidth:      "calc(100vw - 48px)",
        }}
      >
        {toasts.map((t) => {
          const c = CORES[t.tipo];
          return (
            <div
              key={t.id}
              role="status"
              style={{
                background:    c.bg,
                border:        `1px solid ${c.border}`,
                color:         "#ffffff",
                padding:       "12px 18px",
                borderRadius:  6,
                fontFamily:    "'Inclusive Sans', sans-serif",
                fontSize:      "0.9rem",
                fontWeight:    600,
                minWidth:      260,
                maxWidth:      380,
                display:       "flex",
                alignItems:    "center",
                gap:           10,
                boxShadow:     "0 6px 20px rgba(0,0,0,0.25)",
                animation:     "pceToastIn 0.22s ease-out",
                pointerEvents: "auto",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width:          22,
                  height:         22,
                  borderRadius:   "50%",
                  background:     "rgba(255,255,255,0.22)",
                  display:        "inline-flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       "0.85rem",
                  fontWeight:     700,
                  flexShrink:     0,
                }}
              >
                {c.icon}
              </span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{t.mensagem}</span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes pceToastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

/** Hook para disparar notificações em qualquer componente */
export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de um ToastProvider");
  return ctx;
}
