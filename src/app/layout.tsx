import type { Metadata } from "next";
import Providers from "./providers";

// Aqui você define o título que aparece na aba do navegador e pro Google
export const metadata: Metadata = {
  title: "Portal Conecta Escolar",
  description: "Plataforma inteligente escolar para gestão de atividades",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}