"use client";

import { useMemo } from "react";
import { useTheme } from "@mui/material";

/**
 * Extrai as cores do tema MUI atual e retorna estilos reutilizáveis
 * para inputs, botões e dialogs. As cores mudam automaticamente quando
 * o usuário troca o esquema de cores no widget de acessibilidade.
 *
 * Os objetos retornados são memoizados pela cor do tema, evitando que
 * o Emotion precise rehasher os mesmos `sx` a cada render do consumidor.
 */
export function useColors() {
  const theme = useTheme();

  const primary  = theme.palette.primary.main;
  const bg       = theme.palette.background.default;
  const paper    = theme.palette.background.paper;
  const textMain = theme.palette.text.primary;

  return useMemo(() => ({
    primary,
    bg,
    paper,
    textMain,

    inputStyle: {
      "& .MuiOutlinedInput-root": {
        color:      textMain,
        fontFamily: "'Inclusive Sans', sans-serif",
        "& fieldset":              { borderColor: "rgba(255,255,255,0.12)" },
        "&:hover fieldset":        { borderColor: `${primary}88` },
        "&.Mui-focused fieldset":  { borderColor: primary },
      },
      "& .MuiInputLabel-root":            { color: "rgba(255,255,255,0.5)", fontFamily: "'Inclusive Sans', sans-serif" },
      "& .MuiInputLabel-root.Mui-focused": { color: primary },
      "& .MuiSelect-icon":                { color: "rgba(255,255,255,0.5)" },
    },

    btnPrimary: {
      background: primary,
      color:      bg,
      fontWeight: 700,
      fontFamily: "'Inclusive Sans', sans-serif",
      "&:hover":    { background: primary, filter: "brightness(0.88)" },
      "&:disabled": { background: `${primary}44`, color: "rgba(255,255,255,0.3)" },
    },

    btnOutlined: {
      borderColor: `${primary}66`,
      color:       primary,
      fontFamily:  "'Inclusive Sans', sans-serif",
      "&:hover":   { borderColor: primary, background: `${primary}18` },
    },

    dialogPaper: {
      background:  paper,
      border:      "1px solid rgba(255,255,255,0.08)",
      color:       textMain,
      borderRadius: "4px",
      fontFamily:  "'Inclusive Sans', sans-serif",
    },
  }), [primary, bg, paper, textMain]);
}
