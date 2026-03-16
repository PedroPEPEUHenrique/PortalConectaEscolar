"use client";

import { useEffect, useState } from "react";
import {
  Box, Typography, Chip, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem
} from "@mui/material";

import { supabase } from "@/lib/supabase";

type Atividade = {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  arquivo_pdf_url?: string; 
};

export default function Activities() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para guardar o cargo do usuário logado (aluno, professor, admin)
  const [userRole, setUserRole] = useState<string | null>(null);

  const [openModal, setOpenModal] = useState(false);
  
  // Guarda o ID da atividade se estivermos editando (ou null se for nova)
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [novaAtividade, setNovaAtividade] = useState({
    titulo: "",
    descricao: "",
    status: "Pendente",
  });
  
  const [arquivoPDF, setArquivoPDF] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);

  // 🟢 CORRIGIDO: Função para descobrir o cargo do usuário e tratar a string
  const carregarPerfilUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('perfis')
          .select('cargo')
          .eq('id', user.id)
          .single();
          
        if (data && !error) {
          // Trata a string para minúsculas e tira espaços para evitar bugs na comparação
          const cargoTratado = data.cargo.toLowerCase().trim();
          console.log("Cargo carregado do Supabase:", cargoTratado);
          setUserRole(cargoTratado);
        } else {
          console.error("Erro ao buscar perfil na tabela:", error);
        }
      } else {
        console.log("Nenhum usuário logado na sessão.");
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const buscarAtividades = async () => {
    try {
      const resposta = await fetch("/api/atividades");
      const dados = await resposta.json();
      if (resposta.ok) setAtividades(dados);
    } catch (error) {
      console.error("Erro ao buscar dados", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfilUsuario(); 
    buscarAtividades();
  }, []);

  const handleSalvar = async () => {
    if (!novaAtividade.titulo || !novaAtividade.descricao) return; 
    
    setSalvando(true);
    
    try {
      let pdfUrl = null;

      // Se houver um novo arquivo, faz o upload primeiro
      if (arquivoPDF) {
        const fileExt = arquivoPDF.name.split('.').pop();
        const fileName = `atividade-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('atividades_pdfs')
          .upload(fileName, arquivoPDF);

        if (uploadError) {
          console.error("Erro no upload do Supabase:", uploadError);
          alert("Erro ao fazer o upload do PDF. Verifique o console.");
          throw uploadError; 
        }

        const { data: publicUrlData } = supabase.storage
          .from('atividades_pdfs')
          .getPublicUrl(fileName);

        pdfUrl = publicUrlData.publicUrl;
      }

      const payloadParaAPI = {
        ...novaAtividade,
        arquivo_pdf_url: pdfUrl,
      };

      let resposta;

      // LÓGICA DE DECISÃO: EDITAR (PUT) ou CRIAR NOVA (POST)
      if (editandoId) {
        resposta = await fetch(`/api/atividades/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          // Se não houver pdfUrl novo, mandamos os outros dados para atualizar
          body: JSON.stringify(pdfUrl ? payloadParaAPI : novaAtividade),
        });
      } else {
        resposta = await fetch("/api/atividades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadParaAPI),
        });
      }

      const dadosResposta = await resposta.json(); 

      if (resposta.ok) {
        buscarAtividades();
        setOpenModal(false);
        setNovaAtividade({ titulo: "", descricao: "", status: "Pendente" }); 
        setArquivoPDF(null); 
        setEditandoId(null); // Limpa o estado de edição
      } else {
         console.error("ERRO EXATO DA API:", dadosResposta);
         alert("O Banco de dados recusou: " + JSON.stringify(dadosResposta));
      }

    } catch (error) {
      console.error("Erro no processo de salvamento", error);
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = (id: string) => {
    const atividadeParaEditar = atividades.find(a => a.id === id);
    if (!atividadeParaEditar) return;

    setNovaAtividade({
      titulo: atividadeParaEditar.titulo,
      descricao: atividadeParaEditar.descricao,
      status: atividadeParaEditar.status,
    });
    
    setEditandoId(id);
    setOpenModal(true);
  };

  const handleExcluir = async (id: string) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta atividade?");
    if (!confirmar) return;

    try {
      const resposta = await fetch(`/api/atividades/${id}`, {
        method: "DELETE",
      });

      if (resposta.ok) {
        buscarAtividades();
      } else {
        const dadosErro = await resposta.json();
        alert("Erro ao excluir: " + JSON.stringify(dadosErro));
      }
    } catch (error) {
      console.error("Erro ao excluir", error);
    }
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
            📚 Atividades Acadêmicas
          </Typography>
          
          {(userRole === 'professor' || userRole === 'admin') && (
            <Button
              variant="contained"
              onClick={() => {
                setEditandoId(null); // Garante que é uma nova atividade
                setNovaAtividade({ titulo: "", descricao: "", status: "Pendente" });
                setOpenModal(true);
              }}
              sx={{
                background: "#00ff99", color: "#0f172a", fontWeight: "bold", borderRadius: 3, px: 4, py: 1.5,
                "&:hover": { background: "#00e68a", boxShadow: "0 0 20px rgba(0,255,153,0.5)" },
              }}
            >
              + Nova Atividade
            </Button>
          )}
        </Box>

        {/* LISTA */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" mt={10}>
            <CircularProgress sx={{ color: "#00ff99" }} />
          </Box>
        ) : atividades.length === 0 ? (
          <Typography variant="h6" textAlign="center" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Nenhuma atividade cadastrada no momento.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 4, flexWrap: "wrap" }}>
            {atividades.map((item) => (
              <Box
                key={item.id}
                sx={{
                  flex: "1 1 18%", minWidth: "280px", maxWidth: "320px", height: "420px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,255,153,0.4)", borderRadius: 6, p: 6,
                  backdropFilter: "blur(14px)", display: "flex", flexDirection: "column", justifyContent: "space-between",
                  transition: "all 0.3s ease",
                  "&:hover": { boxShadow: "0 0 45px rgba(0,255,153,0.7)", transform: "translateY(-10px)" },
                }}
              >
                <Box>
                  <Typography variant="h6" mb={3}>{item.titulo}</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem" }}>{item.descricao}</Typography>
                  
                  {item.arquivo_pdf_url && (
                    <Box mt={2}>
                      <a href={item.arquivo_pdf_url} target="_blank" rel="noopener noreferrer" style={{ color: "#00e5ff", textDecoration: "none", fontSize: "0.9rem" }}>
                         📎 Baixar PDF Anexo
                      </a>
                    </Box>
                  )}
                </Box>
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Chip
                    label={item.status}
                    sx={{
                      alignSelf: "flex-start", fontWeight: "bold", fontSize: "0.85rem", px: 2, py: 1, borderRadius: "20px",
                      background: item.status === "Concluído" ? "#00ff99" : item.status === "Em andamento" ? "#00e5ff" : "#ff9800",
                      color: "#0f172a",
                    }}
                  />
                  
                  {(userRole === 'professor' || userRole === 'admin') && (
                    <Box display="flex" gap={1} mt={1}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        sx={{ borderColor: "#00e5ff", color: "#00e5ff", fontSize: "0.7rem" }}
                        onClick={() => handleEditar(item.id)}
                      >
                        Editar
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        sx={{ borderColor: "#ff4444", color: "#ff4444", fontSize: "0.7rem" }}
                        onClick={() => handleExcluir(item.id)}
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

        {/* MODAL */}
        <Dialog 
          open={openModal} 
          onClose={() => {
            setOpenModal(false);
            setEditandoId(null);
            setNovaAtividade({ titulo: "", descricao: "", status: "Pendente" });
          }}
          PaperProps={{
            sx: {
              background: "#111827", 
              border: "1px solid rgba(0,255,153,0.4)",
              color: "white", borderRadius: 4, minWidth: "400px"
            }
          }}
        >
          <DialogTitle sx={{ color: "#00ff99", fontWeight: "bold" }}>
            {editandoId ? "Editar Atividade" : "Nova Atividade"}
          </DialogTitle>
          
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField
              label="Título"
              fullWidth
              value={novaAtividade.titulo}
              onChange={(e) => setNovaAtividade({ ...novaAtividade, titulo: e.target.value })}
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }}
              InputProps={{ style: { color: "white" } }}
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } } }}
            />
            
            <TextField
              label="Descrição"
              multiline rows={3} fullWidth
              value={novaAtividade.descricao}
              onChange={(e) => setNovaAtividade({ ...novaAtividade, descricao: e.target.value })}
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }}
              InputProps={{ style: { color: "white" } }}
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } } }}
            />

            <TextField
              select label="Status" fullWidth
              value={novaAtividade.status}
              onChange={(e) => setNovaAtividade({ ...novaAtividade, status: e.target.value })}
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }}
              InputProps={{ style: { color: "white" } }}
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } } }}
            >
              <MenuItem value="Pendente">Pendente</MenuItem>
              <MenuItem value="Em andamento">Em andamento</MenuItem>
              <MenuItem value="Concluído">Concluído</MenuItem>
            </TextField>

            <Button variant="outlined" component="label" sx={{ borderColor: "#00e5ff", color: "#00e5ff", mt: 1 }}>
              {arquivoPDF ? arquivoPDF.name : (editandoId ? "Substituir Arquivo (Opcional)" : "Anexar Arquivo (PDF)")}
              <input 
                type="file" 
                hidden 
                accept="application/pdf" 
                onChange={(e) => setArquivoPDF(e.target.files?.[0] || null)}
              />
            </Button>
            <Typography variant="caption" color="gray">
              {arquivoPDF ? "Pronto para envio." : "Nenhum arquivo selecionado (Opcional)."}
            </Typography>

          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => {
                setOpenModal(false);
                setEditandoId(null);
                setNovaAtividade({ titulo: "", descricao: "", status: "Pendente" });
              }} 
              sx={{ color: "gray" }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSalvar} 
              variant="contained" 
              disabled={salvando}
              sx={{ background: "#00ff99", color: "#0f172a", fontWeight: "bold", "&:hover": { background: "#00e68a" } }}
            >
              {salvando ? "Salvando..." : (editandoId ? "Atualizar Atividade" : "Salvar Atividade")}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
}