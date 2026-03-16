"use client";

import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 14, // 🔥 Aumentado espaço superior
        pb: 12,
      }}
    >
      {/* CONTAINER CENTRAL */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          px: 6,
          textAlign: "center",
        }}
      >
        {/* TÍTULO */}
        <Typography variant="h2" fontWeight="bold" mb={6}>
          👋 Bem-vindo ao Conecta Portal Escola
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: "rgba(255,255,255,0.75)",
            maxWidth: "800px",
            margin: "0 auto",
            
          }}
          mb={18}        >
          Uma plataforma moderna para gestão acadêmica, comunicação
          escolar e organização educacional.
         <p/>
         
        </Typography>

        {/* CARDS PRINCIPAIS */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 6, // 🔥 Espaçamento maior entre os cards
            flexWrap: "wrap",
          }}
        >
          {[
            {
              titulo: "📚 Atividades",
              descricao: "Gerencie tarefas, trabalhos e avaliações.",
              link: "/activities",
            },
            {
              titulo: "📅 Calendário",
              descricao: "Acompanhe eventos e datas importantes.",
              link: "/calendario",
            },
            {
              titulo: "🌐 Comunidade",
              descricao: "Fique por dentro das novidades escolares.",
              link: "/comunidade",
            },
            {
              titulo: "💬 Feedback",
              descricao: "Envie sugestões e opiniões.",
              link: "/feedback",
            },
          ].map((item, index) => (
            <Box
              key={index}
              sx={{
                flex: "1 1 22%",
                minWidth: "260px",
                height: "320px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(0,255,153,0.4)",
                borderRadius: 6,
                p: 6,
                backdropFilter: "blur(14px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 0 40px rgba(0,255,153,0.7)",
                  transform: "translateY(-10px)",
                },
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                  {item.titulo}
                </Typography>

                <Typography
                  sx={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {item.descricao}
                </Typography>
              </Box>

              <Link href={item.link}>
                <Button
                  sx={{
                    mt: 4, // 🔥 Mais espaço antes do botão
                    background: "#00ff99",
                    color: "#0f172a",
                    fontWeight: "bold",
                    borderRadius: 3,
                    "&:hover": {
                      boxShadow:
                        "0 0 25px rgba(0,255,153,0.8)",
                      background: "#00e68a",
                    },
                  }}
                >
                  Acessar
                </Button>
              </Link>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}