"use client";

import { useState } from "react";
import { Box, Typography, TextField, Button, MenuItem, CircularProgress, Alert } from "@mui/material";
import { useColors } from "@/hooks/useColors";

const TIPOS = ["Elogio", "Sugestão", "Reclamação", "Problema Técnico"];

export default function Feedback() {
  const { primary, bg, paper, btnPrimary, btnOutlined, inputStyle } = useColors();

  const [nome, setNome]         = useState("");
  const [email, setEmail]       = useState("");
  const [tipo, setTipo]         = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso]   = useState(false);
  const [erro, setErro]         = useState<string | null>(null);

  const handleEnviar = async (anonimo: boolean) => {
    setErro(null);
    if (!anonimo && (!nome.trim() || !email.trim())) {
      setErro("Preencha nome e e-mail, ou escolha envio anônimo.");
      return;
    }
    if (!tipo || !mensagem.trim()) {
      setErro("Escolha o tipo de feedback e escreva a mensagem.");
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        nome:     anonimo ? "Anônimo" : nome.trim(),
        email:    anonimo ? "anonimo@portal.com" : email.trim(),
        tipo,
        mensagem: mensagem.trim(),
      };

      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Lê como texto primeiro e tenta parsear — evita crash quando o servidor
      // retorna body vazio (ex: erro 500 sem JSON)
      const texto = await res.text();
      let data: { erro?: string } = {};
      try { data = texto ? JSON.parse(texto) : {}; } catch { /* ignora */ }

      if (!res.ok) {
        throw new Error(data.erro ?? `Erro ${res.status} ao enviar`);
      }

      setSucesso(true);
      setNome(""); setEmail(""); setTipo(""); setMensagem("");
      setTimeout(() => setSucesso(false), 6000);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao enviar feedback. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", px: 3, pt: 10, pb: 10 }}>
      <Box sx={{
        width: "100%", maxWidth: 600,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${primary}44`,
        borderRadius: 3, p: { xs: 4, md: 6 },
      }}>
        <Typography variant="h4" fontWeight={700} mb={1} textAlign="center" sx={{ color: "white" }}>
          Enviar Feedback
        </Typography>
        <Typography variant="body2" mb={4} textAlign="center" sx={{ color: "rgba(255,255,255,0.5)" }}>
          Sua opinião é importante. Apenas a Gestão terá acesso a esta mensagem.
        </Typography>

        {sucesso ? (
          <Box sx={{ p: 4, textAlign: "center", background: `${primary}15`, borderRadius: 2, border: `1px solid ${primary}` }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: primary }}>Feedback enviado com sucesso!</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}>
              A gestão escolar já recebeu sua mensagem. Obrigado pela colaboração.
            </Typography>
          </Box>
        ) : (
          <>
            {erro && (
              <Alert severity="error" sx={{ mb: 3, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", "& .MuiAlert-icon": { color: "#f87171" } }}>
                {erro}
              </Alert>
            )}

            <TextField fullWidth label="Nome" margin="normal" value={nome}
              onChange={e => setNome(e.target.value)} inputProps={{ maxLength: 100 }} sx={inputStyle} />

            <TextField fullWidth label="E-mail" type="email" margin="normal" value={email}
              onChange={e => setEmail(e.target.value)} inputProps={{ maxLength: 254 }} sx={inputStyle} />

            <TextField select fullWidth label="Tipo de Feedback" margin="normal" value={tipo}
              onChange={e => setTipo(e.target.value)} sx={inputStyle}
              SelectProps={{ MenuProps: { PaperProps: { sx: { background: paper, color: "white" } } } }}>
              {TIPOS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>

            <TextField fullWidth label="Mensagem" multiline rows={4} margin="normal" value={mensagem}
              onChange={e => setMensagem(e.target.value)} inputProps={{ maxLength: 2000 }} sx={inputStyle} />

            <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
              <Button fullWidth variant="contained" disabled={enviando} onClick={() => handleEnviar(false)} sx={btnPrimary}>
                {enviando ? <CircularProgress size={22} sx={{ color: "inherit" }} /> : "Enviar Identificado"}
              </Button>
              <Button fullWidth variant="outlined" disabled={enviando} onClick={() => handleEnviar(true)} sx={btnOutlined}>
                {enviando ? <CircularProgress size={22} sx={{ color: "inherit" }} /> : "Enviar Anônimo"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
