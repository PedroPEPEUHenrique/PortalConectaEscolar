"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, CircularProgress, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, MenuItem, Divider,
  IconButton, Tooltip, Autocomplete,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

type Turma = {
  id: string;
  nome: string;
  descricao: string;
  ano_letivo: string;
  created_at: string;
  turma_alunos: { count: number }[];
  turma_professores: { perfis: { id: string; email: string; nome_completo: string | null } }[];
};

type Usuario = { id: string; email: string; nome_completo: string | null; cargo: string };
type Membro = { id: string; email: string; nome_completo: string | null };

const ANO_ATUAL = new Date().getFullYear().toString();

export default function TurmasPage() {
  const { cargo, loading: authLoading } = useAuth();
  const router = useRouter();
  const { primary, bg, paper, inputStyle, btnPrimary, btnOutlined, dialogPaper } = useColors();

  const podeAcessar = cargo === "gestor" || cargo === "admin";

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);

  const [openTurma, setOpenTurma] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "", ano_letivo: ANO_ATUAL });

  const [openMembros, setOpenMembros] = useState(false);
  const [turmaAtiva, setTurmaAtiva] = useState<Turma | null>(null);
  const [membros, setMembros] = useState<{ professores: Membro[]; alunos: Membro[] }>({ professores: [], alunos: [] });
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [usuarios, setUsuarios] = useState<{ alunos: Usuario[]; professores: Usuario[] }>({ alunos: [], professores: [] });
  const [addAluno, setAddAluno] = useState<Usuario | null>(null);
  const [addProf, setAddProf] = useState<Usuario | null>(null);
  const [adicionando, setAdicionando] = useState(false);

  useEffect(() => {
    if (!authLoading && !podeAcessar) router.replace("/");
  }, [authLoading, podeAcessar, router]);

  const buscarTurmas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/turmas");
      const d = await res.json();
      if (res.ok) setTurmas(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (podeAcessar) buscarTurmas(); }, [podeAcessar, buscarTurmas]);

  useEffect(() => {
    if (!podeAcessar) return;
    Promise.all([
      fetch("/api/usuarios?cargo=aluno").then((r) => r.json()),
      fetch("/api/usuarios?cargo=professor").then((r) => r.json()),
    ]).then(([al, pr]) => {
      setUsuarios({
        alunos: Array.isArray(al) ? al : [],
        professores: Array.isArray(pr) ? pr : [],
      });
    });
  }, [podeAcessar]);

  const handleSalvarTurma = async () => {
    if (!form.nome.trim() || !/^\d{4}$/.test(form.ano_letivo)) return;
    setSalvando(true);
    try {
      const url = editandoId ? `/api/turmas/${editandoId}` : "/api/turmas";
      const method = editandoId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { fecharTurmaModal(); buscarTurmas(); }
      else { const e = await res.json(); alert(e.erro ?? "Erro ao salvar"); }
    } finally { setSalvando(false); }
  };

  const handleEditar = (t: Turma) => {
    setForm({ nome: t.nome, descricao: t.descricao, ano_letivo: t.ano_letivo });
    setEditandoId(t.id);
    setOpenTurma(true);
  };

  const handleExcluir = async (id: string) => {
    if (!confirm("Excluir esta turma? Todos os vínculos serão removidos.")) return;
    const res = await fetch(`/api/turmas/${id}`, { method: "DELETE" });
    if (res.ok) buscarTurmas();
    else alert("Erro ao excluir turma");
  };

  const fecharTurmaModal = () => {
    setOpenTurma(false);
    setEditandoId(null);
    setForm({ nome: "", descricao: "", ano_letivo: ANO_ATUAL });
  };

  const abrirMembros = async (t: Turma) => {
    setTurmaAtiva(t);
    setOpenMembros(true);
    setLoadingMembros(true);
    try {
      const res = await fetch(`/api/turmas/${t.id}/membros`);
      const d = await res.json();
      if (res.ok) setMembros(d);
    } finally { setLoadingMembros(false); }
  };

  const recarregarMembros = async () => {
    if (!turmaAtiva) return;
    const res = await fetch(`/api/turmas/${turmaAtiva.id}/membros`);
    const d = await res.json();
    if (res.ok) setMembros(d);
    buscarTurmas();
  };

  const adicionarMembro = async (user: Usuario, tipo: "aluno" | "professor") => {
    if (!turmaAtiva) return;
    setAdicionando(true);
    try {
      const res = await fetch(`/api/turmas/${turmaAtiva.id}/membros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, tipo }),
      });
      if (res.ok) {
        recarregarMembros();
        if (tipo === "aluno") setAddAluno(null);
        else setAddProf(null);
      } else {
        const e = await res.json();
        alert(e.erro ?? "Erro ao adicionar");
      }
    } finally { setAdicionando(false); }
  };

  const removerMembro = async (user_id: string, tipo: "aluno" | "professor") => {
    if (!turmaAtiva || !confirm("Remover este membro da turma?")) return;
    const res = await fetch(`/api/turmas/${turmaAtiva.id}/membros`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, tipo }),
    });
    if (res.ok) recarregarMembros();
    else alert("Erro ao remover membro");
  };

  const displayNome = (m: Membro) => m.nome_completo || m.email || m.id;

  if (authLoading || !podeAcessar) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: bg }}>
        <CircularProgress sx={{ color: primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: bg, pt: { xs: 6, md: 8 }, pb: 10, px: { xs: 2, md: 6 }, maxWidth: "1100px", margin: "0 auto" }}>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", mb: 5, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: "white", mb: 0.5 }}>Gestão de Turmas</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.88rem" }}>
            Crie turmas e atribua alunos e professores
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpenTurma(true)} sx={{ ...btnPrimary, px: 3 }}>
          + Nova Turma
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress sx={{ color: primary }} />
        </Box>
      ) : turmas.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 12 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>Nenhuma turma cadastrada ainda.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" }, gap: 3 }}>
          {turmas.map((t) => {
            const qtdAlunos = t.turma_alunos?.[0]?.count ?? 0;
            const professores = t.turma_professores?.map((tp) => tp.perfis) ?? [];
            return (
              <Box
                key={t.id}
                sx={{
                  background: paper,
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 2,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: `${primary}44` },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: "white", fontWeight: 700, fontSize: "1rem", lineHeight: 1.3 }}>
                      {t.nome}
                    </Typography>
                    <Chip
                      label={t.ano_letivo}
                      size="small"
                      sx={{ mt: 0.5, background: `${primary}18`, color: primary, fontSize: "0.72rem", height: 20 }}
                    />
                  </Box>
                  <Box display="flex" gap={0.5}>
                    <Tooltip title="Gerenciar membros">
                      <IconButton size="small" onClick={() => abrirMembros(t)}
                        sx={{ color: primary, "&:hover": { background: `${primary}18` } }}>
                        <PeopleAltOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar turma">
                      <IconButton size="small" onClick={() => handleEditar(t)}
                        sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "white" } }}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir turma">
                      <IconButton size="small" onClick={() => handleExcluir(t.id)}
                        sx={{ color: "rgba(248,113,113,0.4)", "&:hover": { color: "#f87171" } }}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {t.descricao && (
                  <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.83rem", lineHeight: 1.5 }}>
                    {t.descricao}
                  </Typography>
                )}

                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>
                    <span style={{ color: "white", fontWeight: 600 }}>{qtdAlunos}</span> aluno{qtdAlunos !== 1 ? "s" : ""}
                  </Typography>
                  {professores.length > 0 && (
                    <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>
                      Prof:{" "}
                      {professores.map((p) => (
                        <span key={p.id} style={{ color: primary, fontWeight: 500 }}>
                          {p.nome_completo || p.email}
                        </span>
                      )).reduce<React.ReactNode[]>((acc, el, i) => i === 0 ? [el] : [...acc, ", ", el], [])}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      <Dialog open={openTurma} onClose={fecharTurmaModal} PaperProps={{ sx: { ...dialogPaper, minWidth: { xs: "90vw", sm: 460 } } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>
          {editandoId ? "Editar Turma" : "Nova Turma"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Nome da turma *"
            fullWidth
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            sx={inputStyle}
            inputProps={{ maxLength: 100 }}
          />
          <TextField
            label="Descrição"
            fullWidth
            multiline
            rows={2}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            sx={inputStyle}
            inputProps={{ maxLength: 500 }}
          />
          <TextField
            label="Ano letivo *"
            fullWidth
            value={form.ano_letivo}
            onChange={(e) => setForm({ ...form, ano_letivo: e.target.value })}
            sx={inputStyle}
            inputProps={{ maxLength: 4 }}
            helperText="Ex: 2025"
            FormHelperTextProps={{ sx: { color: "rgba(255,255,255,0.3)" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button onClick={fecharTurmaModal} sx={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inclusive Sans', sans-serif" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvarTurma}
            variant="contained"
            disabled={salvando || !form.nome.trim() || !/^\d{4}$/.test(form.ano_letivo)}
            sx={btnPrimary}
          >
            {salvando ? "Salvando..." : editandoId ? "Atualizar" : "Criar Turma"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMembros}
        onClose={() => { setOpenMembros(false); setTurmaAtiva(null); setAddAluno(null); setAddProf(null); }}
        PaperProps={{ sx: { ...dialogPaper, minWidth: { xs: "92vw", sm: 540 }, maxHeight: "85vh" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 0.5 }}>
          Membros — {turmaAtiva?.nome}
          <Typography component="span" sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", ml: 1 }}>
            {turmaAtiva?.ano_letivo}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: "12px !important", display: "flex", flexDirection: "column", gap: 3 }}>
          {loadingMembros ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: primary }} size={28} />
            </Box>
          ) : (
            <>
              <Box>
                <Typography sx={{ color: primary, fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: 1, mb: 1.5 }}>
                  Professores
                </Typography>

                {membros.professores.length === 0 ? (
                  <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.83rem", mb: 1 }}>
                    Nenhum professor atribuído.
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8, mb: 1.5 }}>
                    {membros.professores.map((p) => (
                      <Box key={p.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", borderRadius: 1, px: 2, py: 1 }}>
                        <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.87rem" }}>
                          {displayNome(p)}
                        </Typography>
                        <Button size="small" onClick={() => removerMembro(p.id, "professor")}
                          sx={{ color: "rgba(248,113,113,0.6)", fontSize: "0.72rem", minWidth: 0, px: 1, "&:hover": { color: "#f87171" } }}>
                          Remover
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Autocomplete
                    options={usuarios.professores.filter((u) => !membros.professores.find((m) => m.id === u.id))}
                    getOptionLabel={(u) => u.nome_completo || u.email}
                    value={addProf}
                    onChange={(_, v) => setAddProf(v)}
                    size="small"
                    fullWidth
                    renderInput={(params) => (
                      <TextField {...params} label="Adicionar professor" sx={inputStyle} />
                    )}
                    noOptionsText={<span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>Nenhum professor disponível</span>}
                  />
                  <Button
                    variant="outlined"
                    disabled={!addProf || adicionando}
                    onClick={() => addProf && adicionarMembro(addProf, "professor")}
                    sx={{ ...btnOutlined, whiteSpace: "nowrap", minWidth: 80 }}
                  >
                    Adicionar
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />

              <Box>
                <Typography sx={{ color: primary, fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: 1, mb: 1.5 }}>
                  Alunos
                </Typography>

                {membros.alunos.length === 0 ? (
                  <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.83rem", mb: 1 }}>
                    Nenhum aluno atribuído.
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8, mb: 1.5 }}>
                    {membros.alunos.map((a) => (
                      <Box key={a.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", borderRadius: 1, px: 2, py: 1 }}>
                        <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.87rem" }}>
                          {displayNome(a)}
                        </Typography>
                        <Button size="small" onClick={() => removerMembro(a.id, "aluno")}
                          sx={{ color: "rgba(248,113,113,0.6)", fontSize: "0.72rem", minWidth: 0, px: 1, "&:hover": { color: "#f87171" } }}>
                          Remover
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Autocomplete
                    options={usuarios.alunos.filter((u) => !membros.alunos.find((m) => m.id === u.id))}
                    getOptionLabel={(u) => u.nome_completo || u.email}
                    value={addAluno}
                    onChange={(_, v) => setAddAluno(v)}
                    size="small"
                    fullWidth
                    renderInput={(params) => (
                      <TextField {...params} label="Adicionar aluno" sx={inputStyle} />
                    )}
                    noOptionsText={<span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>Nenhum aluno disponível</span>}
                  />
                  <Button
                    variant="outlined"
                    disabled={!addAluno || adicionando}
                    onClick={() => addAluno && adicionarMembro(addAluno, "aluno")}
                    sx={{ ...btnOutlined, whiteSpace: "nowrap", minWidth: 80 }}
                  >
                    Adicionar
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={() => { setOpenMembros(false); setTurmaAtiva(null); setAddAluno(null); setAddProf(null); }}
            sx={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inclusive Sans', sans-serif" }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
