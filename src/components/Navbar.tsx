/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

// Removemos o "Login" daqui para tratá-lo dinamicamente lá embaixo
const menuItems = [
  { label: "Home", path: "/" },
  { label: "Institucional", path: "/institucional" },
  { label: "Atividades", path: "/activities" },
  { label: "Calendário", path: "/calendario" },
  { label: "Comunidade", path: "/comunidade" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Trazendo os dados de autenticação do nosso Contexto
  const { user } = useAuth();

  // Estados para o Menu Suspenso (Dropdown) do perfil
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleClose();
    router.push("/login");
  };

  return (
    <>
      <AppBar
        position="fixed" // 🔥 Agora fica fixa
        sx={{
          top: 0,
          background: "#0f172a",
          borderBottom: "2px solid #00ff99",
          boxShadow: "0 0 20px rgba(0,255,153,0.2)",
          zIndex: 1200, // 🔥 Garante que fique acima de tudo
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: "70px",
          }}
        >
          {/* 🔹 ESQUERDA (Logo e Título) */}
          <Box display="flex" alignItems="center">
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <img
                src="/logo-portal-inteligente.png"
                alt="Logo"
                style={{
                  height: 60,
                  width: "auto",
                  marginRight: 12,
                }}
              />
            </Link>

            <Link href="/institucional" style={{ textDecoration: "none" }}>
              <Typography
                variant="h5"
                sx={{
                  color: "#00ff99",
                  fontWeight: "bold",
                  "&:hover": {
                    textShadow: "0 0 15px #00ff99",
                  },
                }}
              >
                Conecta Portal Escolar
              </Typography>
            </Link>
          </Box>

          {/* 🔹 DIREITA (Links e Perfil) */}
          <Box display="flex" alignItems="center">
            {/* Renderiza os links normais */}
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                style={{ textDecoration: "none" }}
              >
                <Button
                  sx={{
                    color: pathname === item.path ? "#00ff99" : "#ffffff",
                    fontWeight: "bold",
                    mx: 1.5,
                    fontSize: "0.95rem",
                    "&:hover": {
                      color: "#00ff99",
                      transform: "translateY(-2px)",
                      textShadow: "0 0 10px #00ff99",
                    },
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            ))}

            {/* 🔹 ÁREA DE AUTENTICAÇÃO */}
            <Box ml={2} pl={2} borderLeft="1px solid rgba(255,255,255,0.2)">
              {user ? (
                // SE ESTIVER LOGADO: Mostra o Avatar e o Menu
                <>
                  <Tooltip title="Configurações da conta">
                    <IconButton onClick={handleClick} size="small" sx={{ p: 0 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: "rgba(0,255,153,0.1)",
                          color: "#00ff99",
                          fontWeight: "bold",
                          border: "2px solid #00ff99",
                          "&:hover": {
                            boxShadow: "0 0 15px rgba(0,255,153,0.5)",
                          }
                        }}
                      >
                        {user.email?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>

                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,255,153,0.15))",
                        mt: 1.5,
                        background: "rgba(15, 23, 42, 0.95)", // Fundo do menu acompanhando seu dark theme
                        backdropFilter: "blur(10px)",
                        color: "white",
                        border: "1px solid rgba(0,255,153,0.3)",
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem sx={{ pointerEvents: 'none', opacity: 0.7, fontSize: '0.85rem' }}>
                      {user.email}
                    </MenuItem>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1 }} />
                    <MenuItem onClick={handleLogout} sx={{ color: "#ff4d4d", fontWeight: "bold" }}>
                      🚪 Sair
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                // SE NÃO ESTIVER LOGADO: Mostra o botão de Login seguindo o seu estilo
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <Button
                    sx={{
                      color: pathname === "/login" ? "#0f172a" : "#00ff99",
                      background: pathname === "/login" ? "#00ff99" : "transparent",
                      border: "1px solid #00ff99",
                      fontWeight: "bold",
                      mx: 1.5,
                      fontSize: "0.95rem",
                      borderRadius: 2,
                      "&:hover": {
                        background: "rgba(0,255,153,0.1)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 0 10px rgba(0,255,153,0.5)",
                      },
                    }}
                  >
                    Login
                  </Button>
                </Link>
              )}
            </Box>

          </Box>
        </Toolbar>
      </AppBar>

      {/* 🔥 Espaço para compensar navbar fixa */}
      <Toolbar sx={{ minHeight: "70px" }} />
    </>
  );
}