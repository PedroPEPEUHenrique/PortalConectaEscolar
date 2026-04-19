"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

// Conteúdo de cada slide do carrossel
const slides = [
  {
    title: "Bem-vindo ao Conecta Portal Escolar",
    desc:  "Tecnologia inteligente para transformar a educação.",
  },
  {
    title: "Gestão Escolar Moderna",
    desc:  "Controle atividades, calendário e desempenho em um só lugar.",
  },
  {
    title: "Comunidade Conectada",
    desc:  "Integração total entre alunos, professores e responsáveis.",
  },
];

/**
 * Carrossel de apresentação da home com efeito fade automático a cada 5s.
 * Utiliza a biblioteca Swiper com paginação clicável customizada para o tema escuro.
 */
export default function Carousel() {
  const router = useRouter();

  return (
    <Box
      sx={{
        width: "100%",
        mt: 4,
        // Personaliza as bolinhas de paginação do Swiper para o tema dark
        "& .swiper-pagination-bullet": {
          backgroundColor: "rgba(255,255,255,0.5)",
          opacity: 1,
        },
        "& .swiper-pagination-bullet-active": {
          backgroundColor: "#00ff99",
          boxShadow: "0 0 10px #00ff99",
        },
      }}
    >
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        style={{ borderRadius: "8px", overflow: "hidden" }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <Box
              sx={{
                height: { xs: 350, sm: 400, md: 500 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: { xs: 3, md: 8 },
                background: "linear-gradient(135deg, #0f172a 0%, #064e3b 100%)",
                border: "1px solid rgba(0, 255, 153, 0.2)",
                color: "white",
              }}
            >
              <Typography
                variant="h2"
                fontWeight="bold"
                mb={3}
                sx={{
                  fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.5rem" },
                  color: "#ffffff",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                {slide.title}
              </Typography>

              <Typography
                variant="body1"
                mb={4}
                sx={{
                  fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
                  color: "rgba(255,255,255,0.8)",
                  maxWidth: "800px",
                }}
              >
                {slide.desc}
              </Typography>

              <Button
                variant="outlined"
                onClick={() => router.push("/login")}
                sx={{
                  color: "#00ff99",
                  borderColor: "#00ff99",
                  borderWidth: "2px",
                  fontWeight: "bold",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  borderRadius: "8px",
                  px: { xs: 4, md: 6 },
                  py: 1.5,
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(0, 255, 153, 0.1)",
                    borderColor: "#00ff99",
                    borderWidth: "2px",
                    transform: "translateY(-3px)",
                    boxShadow: "0 5px 15px rgba(0, 255, 153, 0.3)",
                  },
                }}
              >
                Acessar Portal
              </Button>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
