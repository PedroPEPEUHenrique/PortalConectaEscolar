"use client";

import { Swiper, SwiperSlide } from "swiper/react";
// Componentes principais do Swiper (biblioteca de carrossel)

import { Autoplay, EffectFade, Pagination } from "swiper/modules";
// Módulos extras do Swiper

import "swiper/css";
// Estilo base do Swiper

import "swiper/css/effect-fade";
// Estilo do efeito fade

import "swiper/css/pagination";
// Estilo da paginação (bolinhas)

import { Box, Typography, Button } from "@mui/material";

import { useRouter } from "next/navigation";
// Hook do Next.js para navegação programática

export default function Carousel() {

  const router = useRouter();

  // Lista de slides do carrossel
  const slides = [
    {
      title: "Bem-vindo ao Conecta Portal Escolar",
      desc: "Tecnologia inteligente para transformar a educação.",
    },
    {
      title: "Gestão Escolar Moderna",
      desc: "Controle atividades, calendário e desempenho.",
    },
    {
      title: "Comunidade Conectada",
      desc: "Integração entre alunos, professores e pais.",
    },
  ];

  return (
    // Componente principal do Swiper
    <Swiper

      // Ativa os módulos utilizados
      modules={[Autoplay, EffectFade, Pagination]}

      // Define o efeito de transição
      effect="fade"

      // Configuração do autoplay
      autoplay={{ delay: 4000 }} 
      // Troca de slide a cada 4 segundos

      // Configuração da paginação
      pagination={{ clickable: true }} 
      // Permite clicar nas bolinhas

      // Estilização do carrossel
      style={{ borderRadius: "30px", overflow: "hidden" }}
      // Bordas arredondadas e ocultar conteúdo que ultrapassar
    >

      {/* Percorre os slides e cria cada um dinamicamente */}
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          
          {/* Container do conteúdo do slide */}
          <Box
            sx={{
              height: { xs: 260, md: 350 }, 
              // Altura responsiva:
              // xs (mobile) e md (desktop)

              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",

              // Fundo com gradiente verde
              background:
                "linear-gradient(135deg, #1b5e20, #43a047, #81c784)",

              color: "white", // Texto branco
              px: 3, // Padding horizontal
            }}
          >

            {/* Título do slide */}
            <Typography
              variant="h4"
              md="h3"
              fontWeight="bold"
              mb={2}
            >
              {slide.title}
            </Typography>

            {/* Descrição do slide */}
            <Typography variant="h6" mb={3}>
              {slide.desc}
            </Typography>

            {/* Botão de ação */}
            <Button
              variant="contained"
              onClick={() => router.push("/login")}
              // Ao clicar, redireciona para a página de login

              sx={{
                backgroundColor: "#ffffff",
                color: "#2e7d32",
                fontWeight: "bold",
                borderRadius: 3,
                px: 4,

                // Efeito ao passar o mouse
                "&:hover": {
                  backgroundColor: "#f1f8e9",
                },
              }}
            >
              Acessar Portal
            </Button>

          </Box>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}