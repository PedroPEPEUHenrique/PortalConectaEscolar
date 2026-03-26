"use client";

import { Box } from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Ao consumir o contexto aqui, garantimos que AppShell re-renderiza
  // sempre que colorMode ou fontSizeModifier mudam — e todos os filhos
  // (incluindo Navbar e Footer) recebem o tema atualizado do ThemeProvider pai.
  const { colorMode } = useAccessibility();

  // Mapa de background por modo — espelha exatamente o AccessibilityContext
  const backgrounds: Record<string, string> = {
    padrao:                      "#0f172a",
    "daltonismo-verde-vermelho": "#0f172a",
    monocromatico:               "#0a0a0a",
    "alto-contraste":            "#000000",
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: backgrounds[colorMode] ?? "#0f172a",
        fontFamily: "'Inclusive Sans', sans-serif",
      }}
    >
      <Navbar />
      <Box component="main" id="conteudo-principal" sx={{ flex: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
