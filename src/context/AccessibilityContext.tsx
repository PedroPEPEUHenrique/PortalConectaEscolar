"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

type ColorMode = "padrao" | "daltonismo-verde-vermelho" | "monocromatico" | "alto-contraste";

type AccessibilityContextType = {
  fontSizeModifier: number;
  aumentarFonte: () => void;
  diminuirFonte: () => void;
  resetarFonte: () => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  lupaAtiva: boolean;
  toggleLupa: () => void;
  reducaoMovimento: boolean;
  toggleReducaoMovimento: () => void;
  resetarTudo: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);
const STORAGE_KEY = "portal-escolar-acessibilidade";

function salvarPreferencias(prefs: object) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
}
function carregarPreferencias() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSizeModifier, setFontSizeModifier] = useState(14);
  const [colorMode, setColorModeState] = useState<ColorMode>("padrao");
  const [lupaAtiva, setLupaAtiva] = useState(false);
  const [reducaoMovimento, setReducaoMovimento] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const salvas = carregarPreferencias();
    if (salvas) {
      if (salvas.fontSizeModifier) setFontSizeModifier(salvas.fontSizeModifier);
      if (salvas.colorMode) setColorModeState(salvas.colorMode);
      if (typeof salvas.reducaoMovimento === "boolean") setReducaoMovimento(salvas.reducaoMovimento);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    salvarPreferencias({ fontSizeModifier, colorMode, reducaoMovimento });
  }, [fontSizeModifier, colorMode, reducaoMovimento, hydrated]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducaoMovimento);
  }, [reducaoMovimento]);

  const aumentarFonte = useCallback(() => setFontSizeModifier(p => Math.min(p + 2, 22)), []);
  const diminuirFonte = useCallback(() => setFontSizeModifier(p => Math.max(p - 2, 12)), []);
  const resetarFonte = useCallback(() => setFontSizeModifier(14), []);
  const toggleLupa = useCallback(() => setLupaAtiva(p => !p), []);
  const toggleReducaoMovimento = useCallback(() => setReducaoMovimento(p => !p), []);
  const setColorMode = useCallback((mode: ColorMode) => setColorModeState(mode), []);
  const resetarTudo = useCallback(() => {
    setFontSizeModifier(14);
    setColorModeState("padrao");
    setLupaAtiva(false);
    setReducaoMovimento(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const theme = useMemo(() => {
    // Paletas por modo de cor
    const paletas: Record<ColorMode, { primary: string; secondary: string; bg: string; paper: string }> = {
      padrao:                      { primary: "#00c77a", secondary: "#00b4d8", bg: "#0f172a", paper: "#111827" },
      "daltonismo-verde-vermelho": { primary: "#ffd700", secondary: "#0055ff", bg: "#0f172a", paper: "#111827" },
      monocromatico:               { primary: "#ffffff", secondary: "#cccccc", bg: "#0a0a0a", paper: "#1a1a1a" },
      "alto-contraste":            { primary: "#ffff00", secondary: "#ff6600", bg: "#000000", paper: "#111111" },
    };
    const p = paletas[colorMode];

    return createTheme({
      typography: {
        fontSize: fontSizeModifier,
        // Inclusive Sans em todo o sistema via MUI
        fontFamily: "'Inclusive Sans', sans-serif",
        h1: { fontFamily: "'Inclusive Sans', sans-serif" },
        h2: { fontFamily: "'Inclusive Sans', sans-serif" },
        h3: { fontFamily: "'Inclusive Sans', sans-serif" },
        h4: { fontFamily: "'Inclusive Sans', sans-serif" },
        h5: { fontFamily: "'Inclusive Sans', sans-serif" },
        h6: { fontFamily: "'Inclusive Sans', sans-serif" },
        body1: { fontFamily: "'Inclusive Sans', sans-serif" },
        body2: { fontFamily: "'Inclusive Sans', sans-serif" },
        button: { fontFamily: "'Inclusive Sans', sans-serif" },
      },
      palette: {
        mode: "dark",
        primary: { main: p.primary },
        secondary: { main: p.secondary },
        background: { default: p.bg, paper: p.paper },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            // Aplica a fonte e o background global via CssBaseline
            "html, body": {
              fontFamily: "'Inclusive Sans', sans-serif !important",
              backgroundColor: p.bg,
            },
            // Redução de animações global
            ".reduce-motion *": {
              transition: "none !important",
              animation: "none !important",
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: { textTransform: "none", borderRadius: 8, fontWeight: 600, fontFamily: "'Inclusive Sans', sans-serif" },
          },
        },
        MuiMenuItem: {
          styleOverrides: { root: { fontFamily: "'Inclusive Sans', sans-serif" } },
        },
      },
    });
  }, [fontSizeModifier, colorMode]);

  return (
    <AccessibilityContext.Provider
      value={{ fontSizeModifier, aumentarFonte, diminuirFonte, resetarFonte, colorMode, setColorMode, lupaAtiva, toggleLupa, reducaoMovimento, toggleReducaoMovimento, resetarTudo }}
    >
      <ThemeProvider theme={theme}>
        {/* CssBaseline aplica o background e a fonte globalmente */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility deve ser usado dentro de um AccessibilityProvider");
  return context;
}
