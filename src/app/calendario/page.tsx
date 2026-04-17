"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Chip, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

type Evento = { id: string; data: string; evento: string; tipo: string };

export default function Calendario() {
  const { primary, bg, paper, btnPrimary, inputStyle, dialogPaper } = useColors();

  const { cargo: userRole } = useAuth();

  const [eventos, setEventos]       = useState<Evento[]>([]);
  const [loading, setLoading]       = useState(true);
  const [openModal, setOpenModal]   = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando]     = useState(false);
  const [novoEvento, setNovoEvento] = useState({ data: "", evento: "", tipo: "Evento" });

  const buscarEventos = async () => {
    try {
      const res = await fetch("/api/eventos");
      const dados = await res.json();
      if (res.ok) setEventos(dados);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { buscarEventos(); }, []);

  const handleSalvar = async () => {
    if (!novoEvento.data || !novoEvento.evento) return;
    setSalvando(true);
    try {
      const url = editandoId ? `/api/eventos/${editandoId}` : "/api/eventos";
      const method = editandoId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(novoEvento) });
      if (res.ok) { buscarEventos(); fecharModal(); }
      else { const err = await res.json(); alert("Erro: " + JSON.stringify(err)); }
    } catch {} finally { setSalvando(false); }
  };

  const handleEditar = (id: string) => {
    const ev = eventos.find(e => e.id === id);
    if (!ev) return;
    setNovoEvento({ data: ev.data, evento: ev.evento, tipo: ev.tipo });
    setEditandoId(id); setOpenModal(true);
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm("Deseja excluir este evento?")) return;
    const res = await fetch(`/api/eventos/${id}`, { method: "DELETE" });
    if (res.ok) buscarEventos();
  };

  const fecharModal = () => { setOpenModal(false); setEditandoId(null); setNovoEvento({ data: "", evento: "", tipo: "Evento" }); };
  const podeGerenciar = userRole === "gestor" || userRole === "admin";

  return (
    <Box sx={{ minHeight: "100vh", background: bg, pt: { xs: 6, md: 8 }, pb: 10, px: { xs: 3, md: 6 }, maxWidth: "1200px", margin: "0 auto" }}>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", mb: 6, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: "white", mb: 0.5 }}>Calendário Escolar</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>{eventos.length} evento{eventos.length !== 1 ? "s" : ""}</Typography>
        </Box>
        {podeGerenciar && (
          <Button variant="contained" onClick={() => setOpenModal(true)} sx={btnPrimary}>+ Novo Evento</Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}><CircularProgress sx={{ color: primary }} /></Box>
      ) : eventos.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 12 }}><Typography sx={{ color: "rgba(255,255,255,0.4)" }}>Nenhum evento cadastrado.</Typography></Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" }, gap: 3 }}>
          {eventos.map((item) => (
            <Box key={item.id} sx={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 1, p: 3.5,
              display: "flex", flexDirection: "column", gap: 2,
              transition: "border-color 0.2s", "&:hover": { borderColor: `${primary}44` },
            }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: primary }}>{item.data}</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", lineHeight: 1.6 }}>{item.evento}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", flexWrap: "wrap", gap: 1 }}>
                <Chip label={item.tipo} size="small" sx={{ fontWeight: 600, fontSize: "0.75rem", background: `${primary}22`, color: primary, border: `1px solid ${primary}44` }} />
                {podeGerenciar && (
                  <Box display="flex" gap={1}>
                    <Button size="small" variant="text" onClick={() => handleEditar(item.id)}
                      sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", px: 1, "&:hover": { color: "white" } }}>Editar</Button>
                    <Button size="small" variant="text" onClick={() => handleExcluir(item.id)}
                      sx={{ color: "rgba(248,113,113,0.5)", fontSize: "0.75rem", px: 1, "&:hover": { color: "#f87171" } }}>Excluir</Button>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={openModal} onClose={fecharModal} aria-labelledby="modal-cal-titulo"
        PaperProps={{ sx: { ...dialogPaper, minWidth: { xs: "90vw", sm: 440 } } }}>
        <DialogTitle id="modal-cal-titulo" sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>
          {editandoId ? "Editar Evento" : "Novo Evento"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField label="Data (ex: 2025-06-10)" fullWidth value={novoEvento.data} onChange={e => setNovoEvento({ ...novoEvento, data: e.target.value })} sx={inputStyle} />
          <TextField label="Nome do Evento" fullWidth value={novoEvento.evento} onChange={e => setNovoEvento({ ...novoEvento, evento: e.target.value })} inputProps={{ maxLength: 300 }} sx={inputStyle} />
          <TextField select label="Tipo" fullWidth value={novoEvento.tipo} onChange={e => setNovoEvento({ ...novoEvento, tipo: e.target.value })} sx={inputStyle}
            SelectProps={{ MenuProps: { PaperProps: { sx: { background: paper, color: "white" } } } }}>
            <MenuItem value="Avaliação">Avaliação</MenuItem>
            <MenuItem value="Evento">Evento</MenuItem>
            <MenuItem value="Reunião">Reunião</MenuItem>
            <MenuItem value="Acadêmico">Acadêmico</MenuItem>
            <MenuItem value="Esporte">Esporte</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button onClick={fecharModal} sx={{ color: "rgba(255,255,255,0.4)" }}>Cancelar</Button>
          <Button onClick={handleSalvar} variant="contained" disabled={salvando || !novoEvento.data || !novoEvento.evento} sx={btnPrimary}>
            {salvando ? "Salvando..." : editandoId ? "Atualizar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
