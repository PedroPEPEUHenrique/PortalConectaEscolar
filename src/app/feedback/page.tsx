"use client";

import { useState } from "react";
import {
  Box, Typography, TextField, Button, MenuItem, CircularProgress
} from "@mui/material";

import { supabase } from "@/lib/supabase";

export default function Feedback() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviadoSucesso, setEnviadoSucesso] = useState(false);

  // Estilo padronizado para os campos de texto no tema Dark
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

  const handleEnviar = async (anonimo: boolean) => {
    // Validação básica se não for anônimo
    if (!anonimo && (!nome || !email)) {
      alert("Por favor, preencha nome e e-mail, ou escolha o envio anônimo.");
      return;
    }
    if (!tipo || !mensagem) {
      alert("Por favor, escolha o tipo de feedback e digite a mensagem.");
      return;
    }

    setEnviando(true);

    try {
      // Prepara os dados. Se for anônimo, envia strings fixas.
      const dadosEnvio = {
        nome: anonimo ? "Anônimo" : nome,
        email: anonimo ? "nao-informado@anonimo.com" : email,
        tipo: tipo,
        mensagem: mensagem
      };

      // Insere direto no Supabase (pode ser substituído pela API depois)
      const { error } = await supabase
        .from('feedbacks')
        .insert([dadosEnvio]);

      if (error) throw error;

      setEnviadoSucesso(true);
      
      // Limpa os campos
      setNome("");
      setEmail("");
      setTipo("");
      setMensagem("");

      // Faz a mensagem de sucesso sumir depois de 5 segundos
      setTimeout(() => setEnviadoSucesso(false), 5000);

    } catch (error) {
      console.error("Erro ao enviar feedback", error);
      alert("Ocorreu um erro ao enviar seu feedback. Tente novamente.");
    } finally {
      setEnviando(false);
    }
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
        pt: 10,
        pb: 10
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "600px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(0,255,153,0.4)",
          borderRadius: 1,
          p: 6,
          backdropFilter: "blur(14px)",
          boxShadow: "0 0 40px rgba(0,255,153,0.15)",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={1} textAlign="center" color="white">
          Enviar Feedback
        </Typography>
        
        <Typography variant="body2" mb={4} textAlign="center" sx={{ color: "rgba(255,255,255,0.6)" }}>
          Sua opinião é importante. Escolha se deseja se identificar ou enviar de forma anônima. Apenas a Gestão terá acesso a esta mensagem.
        </Typography>

        {enviadoSucesso ? (
          <Box sx={{ p: 4, textAlign: "center", background: "rgba(0,255,153,0.1)", borderRadius: 1, border: "1px solid #00ff99" }}>
            <Typography variant="h6" color="#00ff99" fontWeight="bold">
              Feedback enviado com sucesso!
            </Typography>
            <Typography variant="body2" color="white" mt={1}>
              A gestão escolar já recebeu sua mensagem. Agradecemos a colaboração.
            </Typography>
          </Box>
        ) : (
          <>
            <TextField
              fullWidth label="Nome" margin="normal" variant="outlined"
              value={nome} onChange={(e) => setNome(e.target.value)}
              sx={textFieldEstilo}
            />

            <TextField
              fullWidth label="Email" margin="normal" variant="outlined" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={textFieldEstilo}
            />

            <TextField
              select fullWidth label="Tipo de Feedback" margin="normal" variant="outlined"
              value={tipo} onChange={(e) => setTipo(e.target.value)}
              sx={{ ...textFieldEstilo, "& .MuiSelect-icon": { color: "rgba(255,255,255,0.7)" } }}
            >
              <MenuItem value="Elogio">Elogio</MenuItem>
              <MenuItem value="Sugestão">Sugestão</MenuItem>
              <MenuItem value="Reclamação">Reclamação</MenuItem>
              <MenuItem value="Problema Técnico">Problema Técnico</MenuItem>
            </TextField>

            <TextField
              fullWidth label="Mensagem" multiline rows={4} margin="normal" variant="outlined"
              value={mensagem} onChange={(e) => setMensagem(e.target.value)}
              sx={textFieldEstilo}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
              <Button
                fullWidth variant="contained"
                disabled={enviando}
                onClick={() => handleEnviar(false)}
                sx={{
                  background: "#00ff99", color: "#0f172a", fontWeight: "bold", borderRadius: 3,
                  "&:hover": { boxShadow: "0 0 30px rgba(0,255,153,0.8)", background: "#00e68a" },
                  "&.Mui-disabled": { background: "rgba(0,255,153,0.3)" }
                }}
              >
                {enviando ? <CircularProgress size={24} sx={{ color: "#0f172a" }} /> : "Enviar Identificado"}
              </Button>

              <Button
                fullWidth variant="outlined"
                disabled={enviando}
                onClick={() => handleEnviar(true)}
                sx={{
                  borderColor: "#00ff99", color: "#00ff99", fontWeight: "bold", borderRadius: 3,
                  "&:hover": { background: "rgba(0,255,153,0.1)", borderColor: "#00ff99" },
                  "&.Mui-disabled": { borderColor: "rgba(0,255,153,0.3)", color: "rgba(0,255,153,0.3)" }
                }}
              >
                {enviando ? <CircularProgress size={24} sx={{ color: "#00ff99" }} /> : "Enviar Anônimo"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}