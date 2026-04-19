"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Avatar, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

type Post = {
  id:       string;
  autor:    string;
  mensagem: string;
};

const FORM_VAZIO = { autor: "", mensagem: "" };

export default function Comunidade() {
  const { primary, bg, btnPrimary, inputStyle, dialogPaper } = useColors();
  const { cargo: userRole } = useAuth();

  const [posts,      setPosts]      = useState<Post[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [openModal,  setOpenModal]  = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando,   setSalvando]   = useState(false);
  const [form,       setForm]       = useState(FORM_VAZIO);

  // Apenas gestor e admin podem publicar / editar / excluir avisos
  const podeGerenciar = userRole === "gestor" || userRole === "admin";

  /** Busca todos os avisos da API e atualiza o estado */
  const buscarPosts = useCallback(async () => {
    try {
      const res   = await fetch("/api/comunidade");
      const dados = await res.json();
      if (res.ok) setPosts(dados);
    } catch {
      // silencia erros de rede
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { buscarPosts(); }, [buscarPosts]);

  /** Cria ou atualiza um aviso via POST/PUT na API */
  const handleSalvar = async () => {
    if (!form.autor.trim() || !form.mensagem.trim()) return;
    setSalvando(true);
    try {
      const url    = editandoId ? `/api/comunidade/${editandoId}` : "/api/comunidade";
      const method = editandoId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        buscarPosts();
        fecharModal();
      } else {
        const err = await res.json();
        alert("Erro: " + (err.erro ?? JSON.stringify(err)));
      }
    } catch {
      // erro de rede
    } finally {
      setSalvando(false);
    }
  };

  /** Preenche o formulário com os dados do aviso selecionado para edição */
  const handleEditar = (id: string) => {
    const p = posts.find(x => x.id === id);
    if (!p) return;
    setForm({ autor: p.autor, mensagem: p.mensagem });
    setEditandoId(id);
    setOpenModal(true);
  };

  /** Solicita confirmação e exclui o aviso via DELETE na API */
  const handleExcluir = async (id: string) => {
    if (!window.confirm("Confirma exclusão deste aviso?")) return;
    const res = await fetch(`/api/comunidade/${id}`, { method: "DELETE" });
    if (res.ok) buscarPosts();
    else alert("Erro ao excluir aviso.");
  };

  /** Fecha e reseta o modal de criação/edição */
  const fecharModal = () => {
    setOpenModal(false);
    setEditandoId(null);
    setForm(FORM_VAZIO);
  };

  return (
    <Box sx={{ minHeight: "100vh", background: bg, pt: { xs: 6, md: 8 }, pb: 10, px: { xs: 3, md: 6 }, maxWidth: "1200px", margin: "0 auto" }}>

      {/* Cabeçalho da página */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", mb: 6, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: "white", mb: 0.5 }}>
            Comunidade Escolar
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
            Avisos e comunicados da escola
          </Typography>
        </Box>
        {podeGerenciar && (
          <Button variant="contained" onClick={() => setOpenModal(true)} sx={btnPrimary}>
            + Novo Aviso
          </Button>
        )}
      </Box>

      {/* Lista de avisos */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress sx={{ color: primary }} />
        </Box>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 12 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.4)" }}>Nenhum aviso publicado.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" }, gap: 3 }}>
          {posts.map((item) => (
            <Box
              key={item.id}
              sx={{
                background: "rgba(255,255,255,0.03)",
                border:     "1px solid rgba(255,255,255,0.07)",
                borderRadius: 1,
                p:          3.5,
                display:    "flex",
                flexDirection: "column",
                gap:        2,
                transition: "border-color 0.2s",
                "&:hover":  { borderColor: `${primary}33` },
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{
                  width: 36, height: 36,
                  background: `${primary}18`,
                  color:      primary,
                  fontWeight: 700,
                  fontSize:   "0.9rem",
                  border:     `1px solid ${primary}33`,
                }}>
                  {item.autor[0]?.toUpperCase()}
                </Avatar>
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "white" }}>
                  {item.autor}
                </Typography>
              </Box>

              <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", lineHeight: 1.7, flex: 1 }}>
                {item.mensagem}
              </Typography>

              {podeGerenciar && (
                <Box display="flex" gap={1}>
                  <Button size="small" variant="text" onClick={() => handleEditar(item.id)}
                    sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", px: 1, "&:hover": { color: "white" } }}
                    aria-label={`Editar aviso de ${item.autor}`}
                  >
                    Editar
                  </Button>
                  <Button size="small" variant="text" onClick={() => handleExcluir(item.id)}
                    sx={{ color: "rgba(248,113,113,0.5)", fontSize: "0.75rem", px: 1, "&:hover": { color: "#f87171" } }}
                    aria-label={`Excluir aviso de ${item.autor}`}
                  >
                    Excluir
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Modal de criação / edição */}
      <Dialog
        open={openModal}
        onClose={fecharModal}
        aria-labelledby="modal-com-titulo"
        PaperProps={{ sx: { ...dialogPaper, minWidth: { xs: "90vw", sm: 460 } } }}
      >
        <DialogTitle id="modal-com-titulo" sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>
          {editandoId ? "Editar Aviso" : "Novo Aviso"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Autor (ex: Coordenação)" fullWidth
            value={form.autor}
            onChange={e => setForm({ ...form, autor: e.target.value })}
            inputProps={{ maxLength: 100 }}
            sx={inputStyle}
          />
          <TextField
            label="Mensagem" multiline rows={4} fullWidth
            value={form.mensagem}
            onChange={e => setForm({ ...form, mensagem: e.target.value })}
            inputProps={{ maxLength: 1000 }}
            sx={inputStyle}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button onClick={fecharModal} sx={{ color: "rgba(255,255,255,0.4)" }}>Cancelar</Button>
          <Button
            onClick={handleSalvar}
            variant="contained"
            disabled={salvando || !form.autor.trim() || !form.mensagem.trim()}
            sx={btnPrimary}
          >
            {salvando ? "Salvando..." : editandoId ? "Atualizar" : "Publicar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
