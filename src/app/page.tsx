"use client";

import { Box, Typography, Button, Chip } from "@mui/material";
import Link from "next/link";
import { useColors } from "@/hooks/useColors";

const cards = [
  { titulo: "Atividades",  descricao: "Gerencie tarefas, trabalhos e avaliações de forma centralizada.", link: "/activities", tag: "Acadêmico" },
  { titulo: "Calendário",  descricao: "Acompanhe eventos, provas e datas importantes do ano letivo.",    link: "/calendario",  tag: "Organização" },
  { titulo: "Comunidade",  descricao: "Fique por dentro das novidades e comunicados escolares.",           link: "/comunidade",  tag: "Social" },
  { titulo: "Suporte (SAC)", descricao: "Envie sugestões, dúvidas e opiniões para a equipe escolar.",    link: "/feedback",   tag: "Ajuda" },
];

export default function Home() {
  const { primary, bg, btnOutlined } = useColors();

  return (
    <Box sx={{ minHeight: "100vh", background: bg, pt: { xs: 6, md: 8 }, pb: 10, px: { xs: 3, md: 6 }, maxWidth: "1200px", margin: "0 auto" }}>

      <Box sx={{ mb: { xs: 8, md: 10 }, maxWidth: 600 }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: "white", lineHeight: 1.2, mb: 2.5, fontSize: { xs: "1.8rem", md: "2.4rem" } }}>
          Bem-vindo ao{" "}
          <Box component="span" sx={{ color: primary }}>Conecta Portal</Box>{" "}
          Escolar
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 520 }}>
          Uma plataforma moderna para gestão acadêmica, comunicação escolar e organização educacional.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 3 }}>
        {cards.map((item) => (
          <Box key={item.link} sx={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "4px", p: 3.5,
            display: "flex", flexDirection: "column", gap: 2,
            transition: "border-color 0.2s, background 0.2s",
            "&:hover": { borderColor: `${primary}44`, background: `${primary}06` },
          }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "white" }}>{item.titulo}</Typography>
                <Chip label={item.tag} size="small" sx={{ fontSize: "0.65rem", height: 20, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }} />
              </Box>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", lineHeight: 1.6 }}>{item.descricao}</Typography>
            </Box>
            <Link href={item.link} style={{ textDecoration: "none", marginTop: "auto" }}>
              <Button fullWidth variant="outlined" size="small" sx={btnOutlined}>Acessar</Button>
            </Link>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
