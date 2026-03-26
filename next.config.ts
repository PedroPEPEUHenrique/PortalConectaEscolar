import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Headers de segurança HTTP globais
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Impede que a página seja carregada em iframe (proteção contra clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Impede sniffing de MIME type
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Controla quais recursos externos podem ser carregados
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Desativa algumas APIs do browser que afetam privacidade
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Proteção XSS básica para browsers antigos
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
      // Cache-Control restritivo para rotas de API
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },

  // Evita expor informações do servidor Next.js
  poweredByHeader: false,
};

export default nextConfig;
