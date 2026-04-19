"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Chip, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem,
} from "@mui/material";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type Atividade = {
  id:              string;
  titulo:          string;
  descricao:       string;
  status:          string;
  arquivo_pdf_url?: string | null;
};

const STATUS_CORES: Record<string, string> = {
  "Concluído":    "#22c55e",
  "Em andamento": "#3b82f6",
  "Pendente":     "#f59e0b",
};

const FORM_VAZIO = { titulo: "", descricao: "", status: "Pendente" };

export default function Activities() {
  const { primary, bg, paper, btnPrimary, inputStyle, dialogPaper } = useColors();
  const { cargo: userRole } = useAuth();

  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [openModal,  setOpenModal]  = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form,       setForm]       = useState(FORM_VAZIO);
  const [arquivoPDF, setArquivoPDF] = useState<File | null>(null);
  const [salvando,   setSalvando]   = useState(false);

  const podeGerenciar = userRole === "professor" || userRole === "admin";

  const buscarAtividades = useCallback(async () => {
    const { data, error } = await supabase
      .from("atividades")
      .select("id, titulo, descricao, status, arquivo_pdf_url, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error && data) setAtividades(data as Atividade[]);
    setLoading(false);
  }, []);

  useEffect(() => { buscarAtividades(); }, [buscarAtividades]);

  const handleSalvar = async () => {
    if (!form.titulo.trim()) return;
    setSalvando(true);
    try {
      let pdfUrl: string | null = null;

      if (arquivoPDF) {
        const ext      = arquivoPDF.name.split(".").pop();
        const fileName = `atividade-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("atividades_pdfs")
          .upload(fileName, arquivoPDF);
        if (upErr) { alert("Erro no upload do PDF: " + upErr.message); throw upErr; }
        const { data: urlData } = supabase.storage
          .from("atividades_pdfs")
          .getPublicUrl(fileName);
        pdfUrl = urlData.publicUrl;
      }

      const payload: Partial<Atividade> = {
        titulo:    form.titulo.trim(),
        descricao: form.descricao.trim(),
        status:    form.status,
      };
      if (pdfUrl) payload.arquivo_pdf_url = pdfUrl;

      if (editandoId) {
        const { error } = await supabase
          .from("atividades")
          .update(payload)
          .eq("id", editandoId);
        if (error) { alert("Erro ao atualizar: " + error.message); return; }
      } else {
        const { error } = await supabase
          .from("atividades")
          .insert([payload]);
        if (error) { alert("Erro ao criar: " + error.message); return; }
      }

      await buscarAtividades();
      fecharModal();
    } catch {
      // já tratado
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = (id: string) => {
    const a = atividades.find(x => x.id === id);
    if (!a) return;
    setForm({ titulo: a.titulo, descricao: a.descricao, status: a.status });
    setEditandoId(id);
    setOpenModal(true);
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm("Confirma exclusão desta atividade?")) return;
    const { error } = await supabase.from("atividades").delete().eq("id", id);
    if (error) { alert("Erro ao excluir: " + error.message); return; }
    buscarAtividades();
  };

  const fecharModal = () => {
    setOpenModal(false);
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setArquivoPDF(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", background: bg, pt: { xs: 6, md: 8 }, pb: 10, px: { xs: 3, md: 6 }, maxWidth: "1200px", margin: "0 auto" }}>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", mb: 6, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: "white", mb: 0.5 }}>
            Atividades Acadêmicas
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
            {atividades.length} atividade{atividades.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        {podeGerenciar && (
          <Button variant="contained" onClick={() => { fecharModal(); setOpenModal(true); }} sx={btnPrimary}>
            + Nova Atividade
          </Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress sx={{ color: primary }} />
        </Box>
      ) : atividades.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 12 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.4)" }}>Nenhuma atividade cadastrada.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" }, gap: 3 }}>
          {atividades.map((item) => (
            <Box
              key={item.id}
              sx={{
                background: "rgba(255,255,255,0.03)",
                border:     "1px solid rgba(255,255,255,0.07)",
                borderRadius: "4px",
                p:          3.5,
                display:    "flex",
                flexDirection: "column",
                gap:        2,
                transition: "border-color 0.2s",
                "&:hover":  { borderColor: `${primary}44` },
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "white" }}>
                {item.titulo}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                {item.descricao}
              </Typography>

              {item.arquivo_pdf_url && (
                <a
                  href={item.arquivo_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: primary, textDecoration: "none", fontSize: "0.82rem" }}
                  aria-label={`Baixar PDF: ${item.titulo}`}
                >
                  Baixar PDF
                </a>
              )}

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", flexWrap: "wrap", gap: 1 }}>
                <Chip
                  label={item.status}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize:   "0.75rem",
                    background: `${STATUS_CORES[item.status] ?? "#6b7280"}22`,
                    color:      STATUS_CORES[item.status] ?? "#9ca3af",
                    border:     `1px solid ${STATUS_CORES[item.status] ?? "#6b7280"}44`,
                  }}
                />
                {podeGerenciar && (
                  <Box display="flex" gap={1}>
                    <Button size="small" variant="text" onClick={() => handleEditar(item.id)}
                      sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", px: 1, "&:hover": { color: "white" } }}
                      aria-label={`Editar: ${item.titulo}`}
                    >
                      Editar
                    </Button>
                    <Button size="small" variant="text" onClick={() => handleExcluir(item.id)}
                      sx={{ color: "rgba(248,113,113,0.5)", fontSize: "0.75rem", px: 1, "&:hover": { color: "#f87171" } }}
                      aria-label={`Excluir: ${item.titulo}`}
                    >
                      Excluir
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Dialog
        open={openModal}
        onClose={fecharModal}
        aria-labelledby="modal-ativ-titulo"
        PaperProps={{ sx: { ...dialogPaper, minWidth: { xs: "90vw", sm: 480 } } }}
      >
        <DialogTitle id="modal-ativ-titulo" sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>
          {editandoId ? "Editar Atividade" : "Nova Atividade"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Título" fullWidth required
            value={form.titulo}
            onChange={e => setForm({ ...form, titulo: e.target.value })}
            inputProps={{ maxLength: 200 }}
            sx={inputStyle}
          />
          <TextField
            label="Descrição" multiline rows={3} fullWidth
            value={form.descricao}
            onChange={e => setForm({ ...form, descricao: e.target.value })}
            inputProps={{ maxLength: 2000 }}
            sx={inputStyle}
          />
          <TextField
            select label="Status" fullWidth
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            sx={inputStyle}
            SelectProps={{ MenuProps: { PaperProps: { sx: { background: paper, color: "white" } } } }}
          >
            <MenuItem value="Pendente">Pendente</MenuItem>
            <MenuItem value="Em andamento">Em andamento</MenuItem>
            <MenuItem value="Concluído">Concluído</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            component="label"
            size="small"
            sx={{ ...btnPrimary, background: "transparent", color: primary, borderColor: `${primary}55`, "&:hover": { background: `${primary}18` } }}
          >
            {arquivoPDF ? arquivoPDF.name : editandoId ? "Substituir PDF (opcional)" : "Anexar PDF (opcional)"}
            <input type="file" hidden accept="application/pdf" onChange={e => setArquivoPDF(e.target.files?.[0] || null)} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button onClick={fecharModal} sx={{ color: "rgba(255,255,255,0.4)" }}>Cancelar</Button>
          <Button
            onClick={handleSalvar}
            variant="contained"
            disabled={salvando || !form.titulo.trim()}
            sx={btnPrimary}
          >
            {salvando ? "Salvando..." : editandoId ? "Atualizar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
