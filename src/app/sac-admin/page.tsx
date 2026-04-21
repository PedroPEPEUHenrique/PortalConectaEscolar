"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, CircularProgress, Chip, MenuItem,
  TextField, Avatar,
} from "@mui/material";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

type Feedback = {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  mensagem: string;
  created_at: string;
};

const TIPOS = ["Todos", "Elogio", "Sugestão", "Reclamação", "Problema Técnico"];

const CHIP_COLORS: Record<string, string> = {
  Elogio: "#22c55e",
  Sugestão: "#3b82f6",
  Reclamação: "#f87171",
  "Problema Técnico": "#f59e0b",
};

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function SacAdminPage() {
  const { cargo, loading: authLoading } = useAuth();
  const router = useRouter();
  const { primary, bg, paper, inputStyle } = useColors();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filtro, setFiltro] = useState("Todos");
  const [loading, setLoading] = useState(true);

  const podeAcessar = cargo === "gestor" || cargo === "admin";

  useEffect(() => {
    if (!authLoading && !podeAcessar) router.replace("/");
  }, [authLoading, podeAcessar, router]);

  useEffect(() => {
    if (!podeAcessar) return;
    fetch("/api/feedbacks")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setFeedbacks(d); })
      .finally(() => setLoading(false));
  }, [podeAcessar]);

  const lista = filtro === "Todos" ? feedbacks : feedbacks.filter((f) => f.tipo === filtro);

  if (authLoading || !podeAcessar) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: bg }}>
        <CircularProgress sx={{ color: primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: bg, pt: { xs: 6, md: 8 }, pb: 10, px: { xs: 2, md: 6 }, maxWidth: "900px", margin: "0 auto" }}>

      <Box sx={{ mb: 5, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: "white", mb: 1 }}>
          Mensagens SAC
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" }}>
          Relatos enviados pelos usuários via formulário de Suporte
        </Typography>
      </Box>

      <Box sx={{ mb: 4, maxWidth: 260 }}>
        <TextField
          select
          label="Filtrar por tipo"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          fullWidth
          size="small"
          sx={inputStyle}
        >
          {TIPOS.map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", mb: 3 }}>
        {lista.length} {lista.length === 1 ? "relato" : "relatos"} encontrado{lista.length !== 1 ? "s" : ""}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress sx={{ color: primary }} />
        </Box>
      ) : lista.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 12 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "1rem" }}>
            Nenhum relato encontrado.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {lista.map((fb) => (
            <Box
              key={fb.id}
              sx={{
                background: paper,
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "4px",
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                transition: "border-color 0.2s",
                "&:hover": { borderColor: `${primary}44` },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <Avatar sx={{ width: 36, height: 36, background: `${primary}22`, color: primary, fontWeight: 700, fontSize: "0.9rem" }}>
                  {fb.nome?.charAt(0)?.toUpperCase() || "?"}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.95rem", lineHeight: 1.2 }}>
                    {fb.nome || "Anônimo"}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>
                    {fb.email || "—"}
                  </Typography>
                </Box>
                <Chip
                  label={fb.tipo}
                  size="small"
                  sx={{
                    background: `${CHIP_COLORS[fb.tipo] ?? primary}22`,
                    color: CHIP_COLORS[fb.tipo] ?? primary,
                    border: `1px solid ${CHIP_COLORS[fb.tipo] ?? primary}44`,
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    height: 24,
                  }}
                />
              </Box>

              <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", lineHeight: 1.65, pl: 0.5 }}>
                {fb.mensagem}
              </Typography>

              <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", textAlign: "right" }}>
                {formatData(fb.created_at)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
