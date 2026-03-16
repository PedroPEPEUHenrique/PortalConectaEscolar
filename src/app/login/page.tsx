"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Importando nosso cliente configurado
import { Box, Typography, TextField, Button, Divider, Alert } from "@mui/material";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  
  // Estados para os campos e para o controle da tela
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estilo padronizado para os campos no tema dark (Bordas neon)
  const textFieldEstilo = {
    "& .MuiOutlinedInput-root": { 
      color: "white",
      "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(0,255,153,0.5)" },
      "&.Mui-focused fieldset": { borderColor: "#00ff99" }
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#00ff99" }
  };

  // Função principal de autenticação
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recarregar a página
    setLoading(true);
    setError(null);

    // Chamada ao Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }

    // Se deu certo, redireciona para a página principal ou dashboard
    console.log("Login efetuado com sucesso!", data.user);
    router.push("/activities"); 
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1000px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(0,255,153,0.4)",
          borderRadius: 6,
          backdropFilter: "blur(14px)",
          boxShadow: "0 0 40px rgba(0,255,153,0.15)",
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // Responsivo: Empilha no celular
          overflow: "hidden",
        }}
      >
        {/* LADO ESQUERDO — LOGO */}
        <Box sx={{ flex: 1, background: "rgba(0,255,153,0.05)", display: "flex", alignItems: "center", justifyContent: "center", p: 6 }}>
          <img src="/logo-portal-inteligente.png" alt="Logo" style={{ width: "220px", height: "auto" }} />
        </Box>

        {/* LADO DIREITO — FORMULÁRIO */}
        <Box 
          component="form" 
          onSubmit={handleLogin} // Formulário aciona a função ao dar Enter ou clicar no botão
          sx={{ flex: 1, p: 6, color: "white" }}
        >
          <Typography variant="h4" fontWeight="bold" mb={4}>
            🔐 Login
          </Typography>

          {/* Mensagem de Erro */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={textFieldEstilo} // Aplicando o estilo neon
          />

          <TextField
            fullWidth
            label="Senha"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={textFieldEstilo} // Aplicando o estilo neon
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.5,
              background: "#00ff99",
              color: "#0f172a",
              fontWeight: "bold",
              borderRadius: 3,
              "&:hover": { boxShadow: "0 0 25px rgba(0,255,153,0.8)", background: "#00e68a" },
              "&:disabled": { background: "rgba(0,255,153,0.3)" }
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.2)" }} />

          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.push('/cadastro')} // Rota para tela de cadastro
            sx={{
              py: 1.5,
              borderColor: "#00ff99", color: "#00ff99", fontWeight: "bold", borderRadius: 3,
              "&:hover": { background: "rgba(0,255,153,0.1)", borderColor: "#00ff99" },
            }}
          >
            Criar Conta
          </Button>

          {/* LINKS */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, fontSize: "0.9rem" }}>
            <Link href="/recuperar-senha" style={{ color: "#00ff99", textDecoration: "none" }}>Recuperar senha</Link>
            <Link href="/alterar-senha" style={{ color: "#00ff99", textDecoration: "none" }}>Alterar senha</Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}