"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Box, Typography, TextField, Button, Alert, InputAdornment, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useColors } from "@/hooks/useColors";

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 60_000;
let tentativas = 0;
let bloqueadoAte = 0;

export default function Login() {
  const router = useRouter();
  const { primary, bg, paper, btnPrimary, inputStyle } = useColors();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [mostrarSenha, setMostrar]  = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() < bloqueadoAte) {
      const restante = Math.ceil((bloqueadoAte - Date.now()) / 1000);
      setError(`Muitas tentativas. Aguarde ${restante}s.`);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError("Insira um e-mail válido."); return; }
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }

    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      tentativas += 1;
      if (tentativas >= MAX_TENTATIVAS) { bloqueadoAte = Date.now() + BLOQUEIO_MS; tentativas = 0; setError("Conta bloqueada temporariamente. Tente em 1 minuto."); }
      else setError("E-mail ou senha incorretos.");
      setLoading(false); return;
    }
    tentativas = 0;
    router.push("/activities");
  }, [email, password, router]);

  return (
    <Box sx={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", px: 3 }}>
      <Box sx={{
        width: "100%", maxWidth: 920,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 2, overflow: "hidden",
        display: "flex", flexDirection: { xs: "column", md: "row" },
      }}>
        {/* Lado esquerdo */}
        <Box sx={{ flex: 1, background: `${primary}08`, borderRight: { md: "1px solid rgba(255,255,255,0.06)" }, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: { xs: 5, md: 6 }, gap: 2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-portal-inteligente.png" alt="Logo Conecta Portal Escolar" style={{ width: 180, height: "auto" }} />
          <Box sx={{ textAlign: "center", mt: 1 }}>
            <Typography sx={{ color: primary, fontWeight: 700, fontSize: "1rem" }}>Conecta Portal Escolar</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", mt: 0.5 }}>Plataforma de Gestão Acadêmica</Typography>
          </Box>
        </Box>

        {/* Formulário */}
        <Box component="form" onSubmit={handleLogin} noValidate autoComplete="on"
          sx={{ flex: 1, p: { xs: 4, md: 6 }, color: "white" }}>
          <Typography variant="h5" fontWeight={700} mb={1}>Entrar na conta</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", mb: 4 }}>Use suas credenciais escolares</Typography>

          {error && (
            <Alert severity="error" role="alert" sx={{ mb: 3, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", "& .MuiAlert-icon": { color: "#f87171" } }}>
              {error}
            </Alert>
          )}

          <TextField fullWidth label="E-mail" type="email" margin="normal" value={email}
            onChange={e => setEmail(e.target.value.trim())} required autoComplete="email"
            inputProps={{ "aria-required": true, maxLength: 254 }} sx={inputStyle} />

          <TextField fullWidth label="Senha" type={mostrarSenha ? "text" : "password"} margin="normal"
            value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
            inputProps={{ "aria-required": true, maxLength: 128 }}
            InputProps={{ endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setMostrar(p => !p)} edge="end"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  sx={{ color: "rgba(255,255,255,0.4)" }}>
                  {mostrarSenha ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            )}} sx={inputStyle} />

          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ ...btnPrimary, mt: 3, py: 1.4 }}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.78rem" }}>
              Acesso restrito. Contas são criadas pelo administrador.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
