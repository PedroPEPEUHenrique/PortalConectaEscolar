"use client";

import { useTheme } from "@mui/material";

/**
 * Hook de conveniência que extrai as cores do tema MUI atual e retorna
 * os estilos reutilizáveis (inputs, botões, dialogs).
 * Como consome o ThemeProvider do AccessibilityContext, as cores mudam
 * automaticamente quando o usuário troca o esquema de cores no widget.
 */
export function useColors() {
  const theme = useTheme();

  const primary  = theme.palette.primary.main;
  const bg       = theme.palette.background.default;
  const paper    = theme.palette.background.paper;
  const textMain = theme.palette.text.primary;

  return {
    /** Cor primária do tema atual (ex: #00c77a) */
    primary,
    /** Background padrão das páginas */
    bg,
    /** Background de superfícies elevadas (modais, cards) */
    paper,
    /** Cor principal do texto */
    textMain,

    /** sx completo para campos MUI TextField no dark theme */
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

    /** sx para botão primário (filled, cor do tema) */
    btnPrimary: {
      background: primary,
      color:      bg,
      fontWeight: 700,
      fontFamily: "'Inclusive Sans', sans-serif",
      "&:hover":    { background: primary, filter: "brightness(0.88)" },
      "&:disabled": { background: `${primary}44`, color: "rgba(255,255,255,0.3)" },
    },

    /** sx para botão outlined com a cor primária */
    btnOutlined: {
      borderColor: `${primary}66`,
      color:       primary,
      fontFamily:  "'Inclusive Sans', sans-serif",
      "&:hover":   { borderColor: primary, background: `${primary}18` },
    },

    /** sx para o Paper do Dialog */
    dialogPaper: {
      background:  paper,
      border:      "1px solid rgba(255,255,255,0.08)",
      color:       textMain,
      borderRadius: "4px",
      fontFamily:  "'Inclusive Sans', sans-serif",
    },
  };
}
