"use client";

import { Box, Typography, Link as MuiLink } from "@mui/material";
import NextLink from "next/link";
import { useColors } from "@/hooks/useColors";

export default function Footer() {
  const { primary, paper } = useColors();
  const anoAtual = new Date().getFullYear();

  const navLinks = [
    { label: "Home", path: "/" }, { label: "Institucional", path: "/institucional" },
    { label: "Atividades", path: "/activities" }, { label: "Calendário", path: "/calendario" },
    { label: "Comunidade", path: "/comunidade" }, { label: "Suporte (SAC)", path: "/feedback" },
  ];
  const legalLinks = [
    { label: "Política de Privacidade", path: "/lgpd" },
    { label: "Política de Cookies", path: "/cookies" },
    { label: "Termos de Uso", path: "/termos" },
  ];

  const linkStyle = {
    color: "rgba(255,255,255,0.45)", fontSize: "0.85rem",
    display: "block", width: "fit-content",
    transition: "color 0.2s", fontFamily: "'Inclusive Sans', sans-serif",
    "&:hover": { color: "rgba(255,255,255,0.9)" },
  };

  return (
    <Box component="footer" sx={{ background: paper, borderTop: "1px solid rgba(255,255,255,0.06)", py: { xs: 5, md: 7 }, px: { xs: 3, md: 6 } }}>
      <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" }, gap: { xs: 4, md: 6 } }}>

          <Box>
            <Typography sx={{ color: primary, fontWeight: 700, fontSize: "0.95rem", mb: 1.5, fontFamily: "'Inclusive Sans', sans-serif" }}>
              Conecta Portal Escolar
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: 320, fontFamily: "'Inclusive Sans', sans-serif" }}>
              Conectando alunos, professores e gestão para um ambiente escolar mais inteligente e colaborativo.
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5, fontFamily: "'Inclusive Sans', sans-serif" }}>
              Navegação
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {navLinks.map(link => (
                <MuiLink key={link.path} component={NextLink} href={link.path} underline="none" sx={linkStyle}>{link.label}</MuiLink>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5, fontFamily: "'Inclusive Sans', sans-serif" }}>
              Legal
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {legalLinks.map(link => (
                <MuiLink key={link.path} component={NextLink} href={link.path} underline="none" sx={linkStyle}>{link.label}</MuiLink>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 6, pt: 4, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", fontFamily: "'Inclusive Sans', sans-serif" }}>
            &copy; {anoAtual} Conecta Portal Escolar. Todos os direitos reservados.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
