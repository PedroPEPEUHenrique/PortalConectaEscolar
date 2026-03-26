"use client";

import { useTheme } from "@mui/material";

export function useColors() {
  const theme = useTheme();

  const primary   = theme.palette.primary.main;
  const bg        = theme.palette.background.default;
  const paper     = theme.palette.background.paper;
  const textMain  = theme.palette.text.primary;

  return {
    primary,
    bg,
    paper,
    textMain,
    inputStyle: {
      "& .MuiOutlinedInput-root": {
        color: textMain,
        fontFamily: "'Inclusive Sans', sans-serif",
        "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
        "&:hover fieldset": { borderColor: `${primary}88` },
        "&.Mui-focused fieldset": { borderColor: primary },
      },
      "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontFamily: "'Inclusive Sans', sans-serif" },
      "& .MuiInputLabel-root.Mui-focused": { color: primary },
      "& .MuiSelect-icon": { color: "rgba(255,255,255,0.5)" },
    },
    btnPrimary: {
      background: primary,
      color: bg,
      fontWeight: 700,
      fontFamily: "'Inclusive Sans', sans-serif",
      "&:hover": { background: primary, filter: "brightness(0.88)" },
      "&:disabled": { background: `${primary}44`, color: "rgba(255,255,255,0.3)" },
    },
    btnOutlined: {
      borderColor: `${primary}66`,
      color: primary,
      fontFamily: "'Inclusive Sans', sans-serif",
      "&:hover": { borderColor: primary, background: `${primary}18` },
    },
    dialogPaper: {
      background: paper,
      border: "1px solid rgba(255,255,255,0.08)",
      color: textMain,
      borderRadius: 1,
      fontFamily: "'Inclusive Sans', sans-serif",
    },
  };
}
