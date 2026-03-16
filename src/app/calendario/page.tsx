"use client";

import { useEffect, useState } from "react";
import {
  Box, Typography, Chip, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem
} from "@mui/material";

import { supabase } from "@/lib/supabase";

type Evento = {
  id: string;
  data: string;
  evento: string;
  tipo: string;
};

export default function Calendario() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  // RBAC: Estado para guardar o cargo do usuário
  const [userRole, setUserRole] = useState<string | null>(null);

  // Estados do Modal
  const [openModal, setOpenModal] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [novoEvento, setNovoEvento] = useState({
    data: "",
    evento: "",
    tipo: "Evento",
  });

  // Verifica quem está logado
  const carregarPerfilUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('perfis')
          .select('cargo')
          .eq('id', user.id)
          .single();
          
        if (data && !error) setUserRole(data.cargo);
      } else {
        // Para testes: descomente para simular um gestor ou admin
        // setUserRole('gestor');
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  // 🟢 REFEITO: Busca os eventos na nossa API usando GET
  const buscarEventos = async () => {
    try {
      const resposta = await fetch("/api/eventos");
      const dados = await resposta.json();
      
      if (resposta.ok) {
        setEventos(dados);
      } else {
        console.error("Erro retornado pela API:", dados);
      }
    } catch (error) {
      console.error("Erro ao fazer o fetch dos eventos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfilUsuario();
    buscarEventos();
  }, []);

  // 🔵 e 🟡 REFEITO: Salva (POST) ou Edita (PUT) passando pela API
  const handleSalvar = async () => {
    if (!novoEvento.data || !novoEvento.evento) return;
    setSalvando(true);
    
    try {
      let resposta;

      if (editandoId) {
        // Faz a requisição PUT para /api/eventos/[id]
        resposta = await fetch(`/api/eventos/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novoEvento),
        });
      } else {
        // Faz a requisição POST para /api/eventos
        resposta = await fetch("/api/eventos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novoEvento),
        });
      }
      
      if (resposta.ok) {
        buscarEventos();
        fecharModal();
      } else {
        const dadosErro = await resposta.json();
        alert("Erro ao salvar o evento: " + JSON.stringify(dadosErro));
      }
    } catch (error) {
      console.error("Erro no processo de salvamento", error);
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = (id: string) => {
    const ev = eventos.find(e => e.id === id);
    if (!ev) return;
    setNovoEvento({ data: ev.data, evento: ev.evento, tipo: ev.tipo });
    setEditandoId(id);
    setOpenModal(true);
  };

  // 🔴 REFEITO: Exclui o evento passando pela API (DELETE)
  const handleExcluir = async (id: string) => {
    if (!window.confirm("Deseja excluir este evento?")) return;
    
    try {
      const resposta = await fetch(`/api/eventos/${id}`, {
        method: "DELETE",
      });

      if (resposta.ok) {
        buscarEventos();
      } else {
        const dadosErro = await resposta.json();
        alert("Erro ao excluir: " + JSON.stringify(dadosErro));
      }
    } catch (error) {
      console.error("Erro na exclusão do evento", error);
    }
  };

  const fecharModal = () => {
    setOpenModal(false);
    setEditandoId(null);
    setNovoEvento({ data: "", evento: "", tipo: "Evento" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh", background: "#0f172a", color: "white",
        display: "flex", flexDirection: "column", alignItems: "center", pt: 10, pb: 10,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1700px", margin: "0 auto", px: 6 }}>
        
        {/* CABEÇALHO */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 8 }}>
          <Typography variant="h3" fontWeight="bold">
            📅 Calendário Escolar
          </Typography>
          
          {/* RBAC: Botão aparece apenas para Gestor ou Admin */}
          {(userRole === 'gestor' || userRole === 'admin') && (
            <Button
              variant="contained"
              onClick={() => setOpenModal(true)}
              sx={{
                background: "#00ff99", color: "#0f172a", fontWeight: "bold", borderRadius: 3, px: 4, py: 1.5,
                "&:hover": { background: "#00e68a", boxShadow: "0 0 20px rgba(0,255,153,0.5)" },
              }}
            >
              + Novo Evento
            </Button>
          )}
        </Box>

        {/* LISTA DE EVENTOS */}
        {loading ? (
          <Box display="flex" justifyContent="center" mt={10}><CircularProgress sx={{ color: "#00ff99" }} /></Box>
        ) : eventos.length === 0 ? (
          <Typography variant="h6" textAlign="center" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Nenhum evento cadastrado.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {eventos.map((item) => (
              <Box
                key={item.id}
                sx={{
                  flex: "1 1 18%", minWidth: "280px", maxWidth: "320px", height: "420px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,255,153,0.4)", borderRadius: 6, p: 6,
                  backdropFilter: "blur(14px)", display: "flex", flexDirection: "column", justifyContent: "space-between",
                  transition: "all 0.3s ease", "&:hover": { boxShadow: "0 0 45px rgba(0,255,153,0.7)", transform: "translateY(-10px)" },
                }}
              >
                <Box>
                  <Typography variant="h4" fontWeight="bold" mb={3}>{item.data}</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", mb: 2 }}>{item.evento}</Typography>
                </Box>

                <Box display="flex" flexDirection="column" gap={2}>
                  <Chip
                    label={item.tipo}
                    sx={{
                      alignSelf: "flex-start", fontWeight: "bold", background: "#00ff99", color: "#0f172a",
                    }}
                  />

                  {/* RBAC: Botões de ação apenas para Gestor ou Admin */}
                  {(userRole === 'gestor' || userRole === 'admin') && (
                    <Box display="flex" gap={1} mt={1}>
                      <Button size="small" variant="outlined" sx={{ borderColor: "#00e5ff", color: "#00e5ff" }} onClick={() => handleEditar(item.id)}>
                        Editar
                      </Button>
                      <Button size="small" variant="outlined" sx={{ borderColor: "#ff4444", color: "#ff4444" }} onClick={() => handleExcluir(item.id)}>
                        Excluir
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* MODAL */}
        <Dialog open={openModal} onClose={fecharModal} PaperProps={{ sx: { background: "#111827", border: "1px solid rgba(0,255,153,0.4)", color: "white", borderRadius: 4, minWidth: "400px" } }}>
          <DialogTitle sx={{ color: "#00ff99", fontWeight: "bold" }}>{editandoId ? "Editar Evento" : "Novo Evento"}</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField
              label="Data (Ex: 10/03)" fullWidth value={novoEvento.data} onChange={(e) => setNovoEvento({ ...novoEvento, data: e.target.value })}
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }} InputProps={{ style: { color: "white" } }}
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } } }}
            />
            <TextField
              label="Nome do Evento" fullWidth value={novoEvento.evento} onChange={(e) => setNovoEvento({ ...novoEvento, evento: e.target.value })}
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }} InputProps={{ style: { color: "white" } }}
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } } }}
            />
            <TextField
              select label="Tipo" fullWidth value={novoEvento.tipo} onChange={(e) => setNovoEvento({ ...novoEvento, tipo: e.target.value })}
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }} InputProps={{ style: { color: "white" } }}
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } } }}
            >
              <MenuItem value="Avaliação">Avaliação</MenuItem>
              <MenuItem value="Evento">Evento</MenuItem>
              <MenuItem value="Reunião">Reunião</MenuItem>
              <MenuItem value="Acadêmico">Acadêmico</MenuItem>
              <MenuItem value="Esporte">Esporte</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={fecharModal} sx={{ color: "gray" }}>Cancelar</Button>
            <Button onClick={handleSalvar} variant="contained" disabled={salvando} sx={{ background: "#00ff99", color: "#0f172a", fontWeight: "bold", "&:hover": { background: "#00e68a" } }}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
}