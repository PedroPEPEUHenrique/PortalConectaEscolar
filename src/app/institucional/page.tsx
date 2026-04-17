/* eslint-disable react/no-unescaped-entities */
"use client";

import { Box, Typography, Button } from "@mui/material";
import { keyframes } from "@mui/system";
import Image from "next/image";
import Link from "next/link";
import { useColors } from "@/hooks/useColors";

const blink = keyframes`
  0%   { opacity: 0.2; }
  20%  { opacity: 1; }
  100% { opacity: 0.2; }
`;

export default function Institucional() {
  const { primary, bg, btnPrimary } = useColors();

  return (
    <Box sx={{ background: bg, color: "white" }}>

      {/* HERO */}
      <Box sx={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", px: 4,
      }}>
        <Image
          src="/logo-portal-inteligente.png"
          alt="Logo Conecta Portal Escolar"
          width={620}
          height={520}
          style={{ maxWidth: "100%", height: "auto" }}
        />

        <Typography variant="h2" fontWeight="bold" mt={1}>
          Conecta Portal Escola
        </Typography>

        <Typography variant="h6" mt={3} maxWidth={700} sx={{ color: "rgba(255,255,255,0.75)" }}>
          Transformando a gestão escolar com tecnologia moderna,
          comunicação eficiente e experiência digital intuitiva.
        </Typography>

        <Box mt={6}>
          <Link href="/login">
            <Button sx={{ ...btnPrimary, px: 6, py: 2, fontSize: "1rem", borderRadius: 4 }}>
              Acessar Sistema
            </Button>
          </Link>
        </Box>
      </Box>

      {/* BENEFÍCIOS */}
      <Box sx={{ maxWidth: "1600px", margin: "0 auto", px: 6, pb: 12 }}>
        <Typography variant="h3" fontWeight="bold" textAlign="center" mb={8}>
          <p />
          Por que escolher o Conecta?
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 4, flexWrap: "wrap" }}>
          {[
            "Gestão acadêmica inteligente",
            "Comunicação direta com responsáveis",
            "Calendário integrado e dinâmico",
            "Relatórios em tempo real",
          ].map((item, index) => (
            <Box
              key={index}
              sx={{
                flex: "1 1 22%", minWidth: "260px", height: "260px",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${primary}44`,
                borderRadius: 6, p: 6,
                backdropFilter: "blur(14px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                textAlign: "center",
                transition: "all 0.3s ease",
                "&:hover": { borderColor: primary, transform: "translateY(-10px)" },
              }}
            >
              <Typography fontSize="1.2rem" fontWeight="bold">{item}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* DEPOIMENTOS */}
      <Box sx={{ maxWidth: "1600px", margin: "0 auto", px: 6, pb: 12 }}>
        <Typography variant="h3" fontWeight="bold" textAlign="center" mb={8}>
          O que dizem sobre nós
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 4, flexWrap: "wrap" }}>
          {[1, 2, 3].map((item) => (
            <Box
              key={item}
              sx={{
                flex: "1 1 30%", minWidth: "280px", height: "320px",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${primary}44`,
                borderRadius: 6, p: 6,
                backdropFilter: "blur(14px)",
                display: "flex", flexDirection: "column",
                justifyContent: "space-between", textAlign: "center",
                transition: "all 0.3s ease",
                "&:hover": { borderColor: primary, transform: "translateY(-10px)" },
              }}
            >
              <Box sx={{
                width: 70, height: 70, margin: "0 auto",
                borderRadius: "50%", background: primary,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {[0, 1, 2].map((delay, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 8, height: 8,
                        backgroundColor: bg,
                        borderRadius: "50%",
                        animation: `${blink} 1.4s infinite`,
                        animationDelay: `${delay * 0.2}s`,
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Typography fontStyle="italic" sx={{ color: "rgba(255,255,255,0.75)" }}>
                "O Conecta revolucionou nossa gestão escolar e
                melhorou a comunicação com pais e alunos."
              </Typography>

              <Typography fontWeight="bold">Diretora Escolar</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* CTA FINAL */}
      <Box sx={{ textAlign: "center", py: 12 }}>
        <Typography variant="h3" fontWeight="bold">
          Pronto para modernizar sua escola?
        </Typography>

        <Typography mt={3} mb={6} sx={{ color: "rgba(255,255,255,0.75)" }}>
          Junte-se às instituições que já transformaram sua gestão.
        </Typography>

        <Link href="/login">
          <Button sx={{ ...btnPrimary, px: 6, py: 2, borderRadius: 4 }}>
            Começar Agora
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
