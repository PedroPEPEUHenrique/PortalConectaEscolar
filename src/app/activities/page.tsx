"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Chip, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Avatar } from "@mui/material";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/lib/supabase";

type Atividade = { id: string; titulo: string; descricao: string; status: string; arquivo_pdf_url?: string };

const statusCores: Record<string, string> = {
  "Concluído":    "#22c55e",
  "Em andamento": "#3b82f6",
  "Pendente":     "#f59e0b",
};

export default function Activities() {
  const { primary, bg, paper, btnPrimary, inputStyle, dialogPaper } = useColors();

  const [atividades, setAtividades]   = useState<Atividade[]>([]);
  const [loading, setLoading]         = useState(true);
  const [userRole, setUserRole]       = useState<string | null>(null);
  const [openModal, setOpenModal]     = useState(false);
  const [editandoId, setEditandoId]   = useState<string | null>(null);
  const [novaAtividade, setNova]      = useState({ titulo: "", descricao: "", status: "Pendente" });
  const [arquivoPDF, setPDF]          = useState<File | null>(null);
  const [salvando, setSalvando]       = useState(false);

  const carregarPerfil = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from("perfis").select("cargo").eq("id", user.id).single();
        if (data && !error) setUserRole(data.cargo.toLowerCase().trim());
      }
    } catch {}
  };

  const buscarAtividades = async () => {
    try {
      const res = await fetch("/api/atividades");
      const dados = await res.json();
      if (res.ok) setAtividades(dados);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { carregarPerfil(); buscarAtividades(); }, []);

  const handleSalvar = async () => {
    if (!novaAtividade.titulo.trim() || !novaAtividade.descricao.trim()) return;
    setSalvando(true);
    try {
      let pdfUrl = null;
      if (arquivoPDF) {
        const fileName = `atividade-${Date.now()}.${arquivoPDF.name.split(".").pop()}`;
        const { error: upErr } = await supabase.storage.from("atividades_pdfs").upload(fileName, arquivoPDF);
        if (upErr) { alert("Erro no upload do PDF."); throw upErr; }
        const { data: urlData } = supabase.storage.from("atividades_pdfs").getPublicUrl(fileName);
        pdfUrl = urlData.publicUrl;
      }
      const payload = { ...novaAtividade, arquivo_pdf_url: pdfUrl };
      const url    = editandoId ? `/api/atividades/${editandoId}` : "/api/atividades";
      const method = editandoId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(pdfUrl ? payload : novaAtividade) });
      if (res.ok) { buscarAtividades(); fecharModal(); }
      else { const err = await res.json(); alert("Erro: " + (err.erro ?? JSON.stringify(err))); }
    } catch {} finally { setSalvando(false); }
  };

  const handleEditar = (id: string) => {
    const a = atividades.find(x => x.id === id);
    if (!a) return;
    setNova({ titulo: a.titulo, descricao: a.descricao, status: a.status });
    setEditandoId(id); setOpenModal(true);
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm("Confirma exclusão desta atividade?")) return;
    const res = await fetch(`/api/atividades/${id}`, { method: "DELETE" });
    if (res.ok) buscarAtividades();
  };

  const fecharModal = () => { setOpenModal(false); setEditandoId(null); setNova({ titulo: "", descricao: "", status: "Pendente" }); setPDF(null); };
  const podeGerenciar = userRole === "professor" || userRole === "admin";

  return (
    <Box sx={{ minHeight: "100vh", background: bg, pt: { xs: 6, md: 8 }, pb: 10, px: { xs: 3, md: 6 }, maxWidth: "1200px", margin: "0 auto" }}>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", mb: 6, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: "white", mb: 0.5 }}>Atividades Acadêmicas</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>{atividades.length} atividade{atividades.length !== 1 ? "s" : ""}</Typography>
        </Box>
        {podeGerenciar && (
          <Button variant="contained" onClick={() => { fecharModal(); setOpenModal(true); }} sx={btnPrimary}>+ Nova Atividade</Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}><CircularProgress sx={{ color: primary }} /></Box>
      ) : atividades.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 12 }}><Typography sx={{ color: "rgba(255,255,255,0.4)" }}>Nenhuma atividade cadastrada.</Typography></Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" }, gap: 3 }}>
          {atividades.map((item) => (
            <Box key={item.id} sx={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 1, p: 3.5,
              display: "flex", flexDirection: "column", gap: 2,
              transition: "border-color 0.2s", "&:hover": { borderColor: `${primary}44` },
            }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "white" }}>{item.titulo}</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.6 }}>{item.descricao}</Typography>
              {item.arquivo_pdf_url && (
                <a href={item.arquivo_pdf_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: primary, textDecoration: "none", fontSize: "0.82rem" }}
                  aria-label={`Baixar PDF: ${item.titulo}`}>Baixar PDF</a>
              )}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", flexWrap: "wrap", gap: 1 }}>
                <Chip label={item.status} size="small" sx={{
                  fontWeight: 600, fontSize: "0.75rem",
                  background: `${statusCores[item.status] ?? "#6b7280"}22`,
                  color: statusCores[item.status] ?? "#9ca3af",
                  border: `1px solid ${statusCores[item.status] ?? "#6b7280"}44`,
                }} />
                {podeGerenciar && (
                  <Box display="flex" gap={1}>
                    <Button size="small" variant="text" onClick={() => handleEditar(item.id)}
                      sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", px: 1, "&:hover": { color: "white" } }}
                      aria-label={`Editar: ${item.titulo}`}>Editar</Button>
                    <Button size="small" variant="text" onClick={() => handleExcluir(item.id)}
                      sx={{ color: "rgba(248,113,113,0.5)", fontSize: "0.75rem", px: 1, "&:hover": { color: "#f87171" } }}
                      aria-label={`Excluir: ${item.titulo}`}>Excluir</Button>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={openModal} onClose={fecharModal} aria-labelledby="modal-ativ-titulo"
        PaperProps={{ sx: { ...dialogPaper, minWidth: { xs: "90vw", sm: 480 } } }}>
        <DialogTitle id="modal-ativ-titulo" sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>
          {editandoId ? "Editar Atividade" : "Nova Atividade"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField label="Título" fullWidth value={novaAtividade.titulo} onChange={e => setNova({ ...novaAtividade, titulo: e.target.value })} required inputProps={{ maxLength: 200 }} sx={inputStyle} />
          <TextField label="Descrição" multiline rows={3} fullWidth value={novaAtividade.descricao} onChange={e => setNova({ ...novaAtividade, descricao: e.target.value })} inputProps={{ maxLength: 2000 }} sx={inputStyle} />
          <TextField select label="Status" fullWidth value={novaAtividade.status} onChange={e => setNova({ ...novaAtividade, status: e.target.value })} sx={inputStyle}
            SelectProps={{ MenuProps: { PaperProps: { sx: { background: paper, color: "white" } } } }}>
            <MenuItem value="Pendente">Pendente</MenuItem>
            <MenuItem value="Em andamento">Em andamento</MenuItem>
            <MenuItem value="Concluído">Concluído</MenuItem>
          </TextField>
          <Button variant="outlined" component="label" size="small" sx={{ ...btnPrimary, background: "transparent", color: primary, borderColor: `${primary}55`, "&:hover": { background: `${primary}18` } }}>
            {arquivoPDF ? arquivoPDF.name : editandoId ? "Substituir PDF (opcional)" : "Anexar PDF (opcional)"}
            <input type="file" hidden accept="application/pdf" onChange={e => setPDF(e.target.files?.[0] || null)} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button onClick={fecharModal} sx={{ color: "rgba(255,255,255,0.4)" }}>Cancelar</Button>
          <Button onClick={handleSalvar} variant="contained" disabled={salvando || !novaAtividade.titulo.trim()} sx={btnPrimary}>
            {salvando ? "Salvando..." : editandoId ? "Atualizar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
