"use client";

import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#22c55e",
    },
    background: {
      default: "#0f172a",
      paper: "rgba(255,255,255,0.05)",
    },
    text: {
      primary: "#e2e8f0",
      secondary: "#94a3b8",
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});