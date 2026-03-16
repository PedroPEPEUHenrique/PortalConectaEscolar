"use client";

import { useEffect, useState } from "react";
import {
  Box, Typography, Avatar, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField
} from "@mui/material";

import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  autor: string;
  mensagem: string;
};

export default function Comunidade() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // RBAC: Estado para guardar o cargo do usuário
  const [userRole, setUserRole] = useState<string | null>(null);

  // Estados do Modal
  const [openModal, setOpenModal] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [novoPost, setNovoPost] = useState({
    autor: "",
    mensagem: "",
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

  // 🟢 REFEITO: Busca os posts na API usando GET
  const buscarPosts = async () => {
    try {
      const resposta = await fetch("/api/comunidade");
      const dados = await resposta.json();
      
      if (resposta.ok) {
        setPosts(dados);
      } else {
        console.error("Erro retornado pela API:", dados);
      }
    } catch (error) {
      console.error("Erro ao fazer o fetch dos posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfilUsuario();
    buscarPosts();
  }, []);

  // 🔵 e 🟡 REFEITO: Salva (POST) ou Edita (PUT) passando pela API
  const handleSalvar = async () => {
    if (!novoPost.autor || !novoPost.mensagem) return;
    setSalvando(true);
    
    try {
      let resposta;

      if (editandoId) {
        // Faz a requisição PUT para /api/comunidade/[id]
        resposta = await fetch(`/api/comunidade/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novoPost),
        });
      } else {
        // Faz a requisição POST para /api/comunidade
        resposta = await fetch("/api/comunidade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novoPost),
        });
      }
      
      if (resposta.ok) {
        buscarPosts();
        fecharModal();
      } else {
        const dadosErro = await resposta.json();
        alert("Erro ao salvar o aviso: " + JSON.stringify(dadosErro));
      }
    } catch (error) {
      console.error("Erro no processo de salvamento", error);
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    setNovoPost({ autor: post.autor, mensagem: post.mensagem });
    setEditandoId(id);
    setOpenModal(true);
  };

  // 🔴 REFEITO: Exclui o post passando pela API (DELETE)
  const handleExcluir = async (id: string) => {
    if (!window.confirm("Deseja excluir este aviso?")) return;
    
    try {
      const resposta = await fetch(`/api/comunidade/${id}`, {
        method: "DELETE",
      });

      if (resposta.ok) {
        buscarPosts();
      } else {
        const dadosErro = await resposta.json();
        alert("Erro ao excluir: " + JSON.stringify(dadosErro));
      }
    } catch (error) {
      console.error("Erro na exclusão do aviso", error);
    }
  };

  const fecharModal = () => {
    setOpenModal(false);
    setEditandoId(null);
    setNovoPost({ autor: "", mensagem: "" });
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
            🌐 Comunidade Escolar
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
              + Novo Aviso
            </Button>
          )}
        </Box>

        {/* LISTA DE POSTS */}
        {loading ? (
          <Box display="flex" justifyContent="center" mt={10}><CircularProgress sx={{ color: "#00ff99" }} /></Box>
        ) : posts.length === 0 ? (
          <Typography variant="h6" textAlign="center" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Nenhum aviso publicado no momento.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {posts.map((item) => (
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
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar sx={{ mr: 2, bgcolor: "#00ff99", color: "#0f172a", fontWeight: "bold" }}>
                      {item.autor[0]}
                    </Avatar>
                    <Typography fontWeight="bold">{item.autor}</Typography>
                  </Box>

                  <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem" }}>
                    {item.mensagem}
                  </Typography>
                </Box>

                {/* RBAC: Botões de ação apenas para Gestor ou Admin */}
                {(userRole === 'gestor' || userRole === 'admin') && (
                  <Box display="flex" gap={1} mt={2}>
                    <Button size="small" variant="outlined" sx={{ borderColor: "#00e5ff", color: "#00e5ff" }} onClick={() => handleEditar(item.id)}>
                      Editar
                    </Button>
                    <Button size="small" variant="outlined" sx={{ borderColor: "#ff4444", color: "#ff4444" }} onClick={() => handleExcluir(item.id)}>
                      Excluir
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* MODAL */}
        <Dialog open={openModal} onClose={fecharModal} PaperProps={{ sx: { background: "#111827", border: "1px solid rgba(0,255,153,0.4)", color: "white", borderRadius: 4, minWidth: "400px" } }}>
          <DialogTitle sx={{ color: "#00ff99", fontWeight: "bold" }}>{editandoId ? "Editar Aviso" : "Novo Aviso"}</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField
              label="Autor (Ex: Coordenação)" fullWidth value={novoPost.autor} onChange={(e) => setNovoPost({ ...novoPost, autor: e.target.value })}
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }} InputProps={{ style: { color: "white" } }}
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } } }}
            />
            <TextField
              label="Mensagem" multiline rows={4} fullWidth value={novoPost.mensagem} onChange={(e) => setNovoPost({ ...novoPost, mensagem: e.target.value })}
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }} InputProps={{ style: { color: "white" } }}
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } } }}
            />
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