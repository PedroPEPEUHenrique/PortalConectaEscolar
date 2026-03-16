"use client";

import { Box, Typography, Link as MuiLink } from "@mui/material";
import NextLink from "next/link";

export default function Footer() {
  const anoAtual = new Date().getFullYear();

  // Array centralizado com os links exatos do seu Navbar
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Institucional", path: "/institucional" },
    { label: "Atividades", path: "/activities" },
    { label: "Calendário", path: "/calendario" },
    { label: "Comunidade", path: "/comunidade" },
    { label: "SAC", path: "/feedback" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: "#0b1120", 
        color: "white",
        py: 6,
        px: 4,
        borderTop: "1px solid rgba(0, 255, 153, 0.2)", 
        mt: "auto", 
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1700px",
          margin: "0 auto",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: 6,
        }}
      >
        {/* COLUNA 1: MARCA E DESCRIÇÃO */}
        <Box sx={{ flex: 1 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#00ff99", mb: 2 }}>
              PortalConectaEscolar
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", maxWidth: "350px", lineHeight: 1.6 }}>
              Conectando alunos, professores e gestão para um ambiente escolar mais inteligente, colaborativo e integrado.
            </Typography>
          </Box>
        </Box>

        {/* COLUNA 2: NAVEGAÇÃO RÁPIDA */}
        <Box sx={{ flex: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Navegação Rápida
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {navLinks.map((link, index) => (
                <MuiLink 
                  key={index}
                  component={NextLink} 
                  href={link.path} 
                  underline="none" 
                  sx={{ 
                    // Se for o SAC, damos um destaque neon. Se não, mantemos o padrão.
                    color: link.label === "SAC" ? "#00ff99" : "rgba(255,255,255,0.7)", 
                    fontWeight: link.label === "SAC" ? "bold" : "normal",
                    transition: "0.2s", 
                    "&:hover": { 
                      color: "#00e5ff", 
                      paddingLeft: "5px",
                      textShadow: link.label === "SAC" ? "0 0 10px rgba(0,255,153,0.5)" : "none"
                    } 
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Box>
        </Box>

        {/* COLUNA 3: POLÍTICAS E LEGAL */}
        <Box sx={{ flex: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Transparência e Legal
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <MuiLink 
                component={NextLink} 
                href="/lgpd" 
                underline="none" 
                sx={{ color: "rgba(255,255,255,0.7)", transition: "0.2s", "&:hover": { color: "#00e5ff", paddingLeft: "5px" } }}
              >
                Política de Privacidade
              </MuiLink>
              
              <MuiLink 
                component={NextLink} 
                href="/cookies" 
                underline="none" 
                sx={{ color: "rgba(255,255,255,0.7)", transition: "0.2s", "&:hover": { color: "#00e5ff", paddingLeft: "5px" } }}
              >
                Política de Cookies
              </MuiLink>
              
              <MuiLink 
                component={NextLink} 
                href="/termos" 
                underline="none" 
                sx={{ color: "rgba(255,255,255,0.7)", transition: "0.2s", "&:hover": { color: "#00e5ff", paddingLeft: "5px" } }}
              >
                Termos de Uso
              </MuiLink>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* LINHA DE COPYRIGHT */}
      <Box
        sx={{
          mt: 6,
          pt: 3,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center",
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
          &copy; {anoAtual} PortalConectaEscolar. Todos os direitos reservados.
        </Typography>
      </Box>
    </Box>
  );
}