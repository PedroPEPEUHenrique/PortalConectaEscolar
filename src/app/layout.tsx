import type { Metadata } from "next";
import Providers from "./providers";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import SkipLink from "@/components/SkipLink";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Conecta Portal Escolar",
  description: "Plataforma inteligente escolar para gestão de atividades, calendário e comunidade.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inclusive+Sans:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Inclusive Sans', sans-serif" }}>
        <SkipLink />
        <Providers>
          {/* AccessibilityProvider contém o ThemeProvider do MUI.
              Tudo dentro dele recebe o tema dinâmico (cores + fonte). */}
          <AccessibilityProvider>
            <AppShell>
              {children}
            </AppShell>
            <AccessibilityWidget />
          </AccessibilityProvider>
        </Providers>
      </body>
    </html>
  );
}
