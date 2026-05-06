"use client";

import React, {
  createContext, useContext, useState, useMemo,
  useEffect, useCallback,
} from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

export type ColorMode =
  | "padrao"
  | "daltonismo-verde-vermelho"
  | "monocromatico"
  | "alto-contraste";

type AccessibilityContextType = {
  fontSizeModifier:       number;
  aumentarFonte:          () => void;
  diminuirFonte:          () => void;
  resetarFonte:           () => void;
  colorMode:              ColorMode;
  setColorMode:           (mode: ColorMode) => void;
  reducaoMovimento:       boolean;
  toggleReducaoMovimento: () => void;
  resetarTudo:            () => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = "portal-escolar-acessibilidade";

const PALETAS: Record<ColorMode, { primary: string; secondary: string; bg: string; paper: string }> = {
  padrao:                      { primary: "#22c55e", secondary: "#60a5fa", bg: "#0f172a", paper: "#111827" },
  "daltonismo-verde-vermelho": { primary: "#ffd700", secondary: "#0055ff", bg: "#0f172a", paper: "#111827" },
  monocromatico:               { primary: "#ffffff", secondary: "#cccccc", bg: "#0a0a0a", paper: "#1a1a1a" },
  "alto-contraste":            { primary: "#ffff00", secondary: "#ff6600", bg: "#000000", paper: "#111111" },
};

/** Salva as preferências de acessibilidade no localStorage */
function salvarPreferencias(prefs: object) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
}

/** Carrega as preferências salvas ou retorna null se não existirem */
function carregarPreferencias() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSizeModifier,  setFontSizeModifier]  = useState(14);
  const [colorMode,         setColorModeState]    = useState<ColorMode>("padrao");
  const [reducaoMovimento,  setReducaoMovimento]  = useState(false);
  // Evita sobrescrever o estado padrão com undefined antes do localStorage ser lido
  const [hydrated,          setHydrated]          = useState(false);

  useEffect(() => {
    const salvas = carregarPreferencias();
    if (salvas) {
      if (salvas.fontSizeModifier)                    setFontSizeModifier(salvas.fontSizeModifier);
      if (salvas.colorMode)                           setColorModeState(salvas.colorMode);
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

  useEffect(() => {
    document.documentElement.style.fontSize = fontSizeModifier + "px";
  }, [fontSizeModifier]);

  /** Aumenta o tamanho da fonte em 2px até o máximo de 22px */
  const aumentarFonte = useCallback(() => setFontSizeModifier(p => Math.min(p + 2, 22)), []);
  /** Diminui o tamanho da fonte em 2px até o mínimo de 12px */
  const diminuirFonte = useCallback(() => setFontSizeModifier(p => Math.max(p - 2, 12)), []);
  /** Retorna o tamanho da fonte ao padrão (14px) */
  const resetarFonte  = useCallback(() => setFontSizeModifier(14), []);

  const toggleReducaoMovimento = useCallback(() => setReducaoMovimento(p => !p), []);
  const setColorMode = useCallback((mode: ColorMode) => setColorModeState(mode), []);

  /** Restaura todas as configurações de acessibilidade ao padrão e limpa o localStorage */
  const resetarTudo = useCallback(() => {
    setFontSizeModifier(14);
    setColorModeState("padrao");
    setReducaoMovimento(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const theme = useMemo(() => {
    const p = PALETAS[colorMode];
    return createTheme({
      typography: {
        fontSize:   fontSizeModifier,
        fontFamily: "'Inclusive Sans', sans-serif",
        h1: { fontFamily: "'Inclusive Sans', sans-serif" },
        h2: { fontFamily: "'Inclusive Sans', sans-serif" },
        h3: { fontFamily: "'Inclusive Sans', sans-serif" },
        h4: { fontFamily: "'Inclusive Sans', sans-serif" },
        h5: { fontFamily: "'Inclusive Sans', sans-serif" },
        h6: { fontFamily: "'Inclusive Sans', sans-serif" },
        body1:  { fontFamily: "'Inclusive Sans', sans-serif" },
        body2:  { fontFamily: "'Inclusive Sans', sans-serif" },
        button: { fontFamily: "'Inclusive Sans', sans-serif" },
      },
      palette: {
        mode:       "dark",
        primary:    { main: p.primary },
        secondary:  { main: p.secondary },
        background: { default: p.bg, paper: p.paper },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            "html, body": {
              fontFamily:      "'Inclusive Sans', sans-serif !important",
              backgroundColor: p.bg,
            },
            ".reduce-motion *": {
              transition: "none !important",
              animation:  "none !important",
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

  // Memoiza o objeto de contexto para que consumidores não re-renderizem
  // quando o provider re-renderiza por outros motivos.
  const ctxValue = useMemo<AccessibilityContextType>(() => ({
    fontSizeModifier,
    aumentarFonte,
    diminuirFonte,
    resetarFonte,
    colorMode,
    setColorMode,
    reducaoMovimento,
    toggleReducaoMovimento,
    resetarTudo,
  }), [
    fontSizeModifier,
    aumentarFonte,
    diminuirFonte,
    resetarFonte,
    colorMode,
    setColorMode,
    reducaoMovimento,
    toggleReducaoMovimento,
    resetarTudo,
  ]);

  return (
    <AccessibilityContext.Provider value={ctxValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AccessibilityContext.Provider>
  );
}

/** Hook para consumir o contexto de acessibilidade em qualquer componente */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility deve ser usado dentro de um AccessibilityProvider");
  return context;
}
