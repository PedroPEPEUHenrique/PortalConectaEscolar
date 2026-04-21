"use client";

import { Box } from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAccessibility } from "@/context/AccessibilityContext";

const BACKGROUNDS: Record<string, string> = {
  padrao:                      "#0f172a",
  "daltonismo-verde-vermelho": "#0f172a",
  monocromatico:               "#0a0a0a",
  "alto-contraste":            "#000000",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { colorMode } = useAccessibility();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: BACKGROUNDS[colorMode] ?? "#0f172a",
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
