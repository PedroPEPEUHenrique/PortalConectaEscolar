/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  AppBar, Toolbar, Box, Button, Avatar, Menu, MenuItem,
  IconButton, Tooltip, Divider, Drawer, List, ListItem,
  ListItemButton, ListItemText, useTheme,
  Dialog, DialogContent, DialogTitle, Typography, CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const BASE_MENU = [
  { label: "Home", path: "/" },
  { label: "Institucional", path: "/institucional" },
  { label: "Atividades", path: "/activities" },
  { label: "Calendário", path: "/calendario" },
  { label: "Comunidade", path: "/comunidade" },
];

const ADMIN_MENU = [
  { label: "Turmas", path: "/turmas" },
  { label: "Mensagens SAC", path: "/sac-admin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, cargo } = useAuth();

  const isGestorOuAdmin = cargo === "gestor" || cargo === "admin";
  const menuItems = isGestorOuAdmin ? [...BASE_MENU, ...ADMIN_MENU] : BASE_MENU;
  // useTheme lê o tema atual do ThemeProvider pai (AccessibilityContext)
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const bg = theme.palette.background.paper;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCarteirinha, setOpenCarteirinha] = useState(false);
  const [perfilAluno, setPerfilAluno] = useState<{ nome_completo: string | null; matricula: string | null } | null>(null);
  const [loadingCarteirinha, setLoadingCarteirinha] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleAbrirCarteirinha = async () => {
    handleClose();
    setOpenCarteirinha(true);
    if (perfilAluno) return;
    setLoadingCarteirinha(true);
    const { data } = await supabase.from("perfis").select("nome_completo, matricula").eq("id", user!.id).single();
    setPerfilAluno({ nome_completo: data?.nome_completo ?? null, matricula: data?.matricula ?? null });
    setLoadingCarteirinha(false);
  };

  const handleLogout = async () => {
    handleClose();
    // signOut() limpa o sb-...-auth-token do localStorage antes de retornar,
    // garantindo que lerSessaoCache() não encontre sessão antiga na página de login
    await supabase.auth.signOut();
    router.push("/login");
  };

  const drawerContent = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ background: bg, height: "100%", color: "white", width: 260 }}
    >
      <Box sx={{ py: 3, px: 3, display: "flex", alignItems: "center" }}>
        <img src="/logo-portal-inteligente.png" alt="Logo Portal Escolar" style={{ height: 40, width: "auto" }} />
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
      <List sx={{ px: 1.5, pt: 1.5 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  color: isActive ? primary : "rgba(255,255,255,0.75)",
                  background: isActive ? `${primary}18` : "transparent",
                  fontFamily: "'Inclusive Sans', sans-serif",
                  "&:hover": { background: "transparent", color: "white" },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: isActive ? 700 : 400,
                    fontFamily: "'Inclusive Sans', sans-serif",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          // Usa a cor do tema em vez de valor fixo
          background: `${bg}f0`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${primary}22`,
          boxShadow: "none",
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: "66px", px: { xs: 2, md: 4 } }}>

          {/* Esquerda */}
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              color="inherit"
              aria-label="Abrir menu de navegação"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: "none" }, color: "rgba(255,255,255,0.7)" }}
            >
              <MenuIcon />
            </IconButton>

            <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <img src="/logo-portal-inteligente.png" alt="Logo" style={{ height: 44, width: "auto" }} />
            </Link>
          </Box>

          {/* Centro — links desktop */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.path} href={item.path} style={{ textDecoration: "none" }}>
                  <Button
                    sx={{
                      color: isActive ? primary : "rgba(255,255,255,0.65)",
                      fontWeight: isActive ? 700 : 400,
                      fontSize: "0.875rem",
                      px: 1.5,
                      py: 0.8,
                      borderRadius: 2,
                      fontFamily: "'Inclusive Sans', sans-serif",
                      background: isActive ? `${primary}18` : "transparent",
                      "&:hover": {
                        color: "white",
                        background: "transparent",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </Box>

          {/* Direita — auth */}
          <Box>
            {user ? (
              <>
                <Tooltip title={`Conta: ${user.email}`}>
                  <IconButton onClick={handleClick} size="small" sx={{ p: 0 }} aria-label="Menu da conta">
                    <Avatar
                      sx={{
                        width: 38, height: 38,
                        background: `${primary}22`,
                        color: primary,
                        fontWeight: 700,
                        border: `1.5px solid ${primary}55`,
                        fontSize: "0.9rem",
                        fontFamily: "'Inclusive Sans', sans-serif",
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
                    sx: {
                      mt: 1,
                      background: bg,
                      border: `1px solid ${primary}22`,
                      color: "white",
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      fontFamily: "'Inclusive Sans', sans-serif",
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem disableRipple sx={{ opacity: 0.5, fontSize: "0.8rem", pointerEvents: "none", py: 0.5, fontFamily: "'Inclusive Sans', sans-serif" }}>
                    {user.email}
                  </MenuItem>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", my: 0.5 }} />
                  {cargo === "aluno" && (
                    <MenuItem onClick={handleAbrirCarteirinha} sx={{ fontSize: "0.875rem", fontFamily: "'Inclusive Sans', sans-serif" }}>
                      Carteirinha de Estudante
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} sx={{ color: "#f87171", fontSize: "0.875rem", fontFamily: "'Inclusive Sans', sans-serif" }}>
                    Sair da conta
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Link href="/login" style={{ textDecoration: "none" }}>
                <Button
                  variant={pathname === "/login" ? "contained" : "outlined"}
                  size="small"
                  sx={{
                    borderColor: `${primary}80`,
                    color: pathname === "/login" ? theme.palette.background.default : primary,
                    background: pathname === "/login" ? primary : "transparent",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    px: 2,
                    fontFamily: "'Inclusive Sans', sans-serif",
                    "&:hover": {
                      background: pathname === "/login" ? primary : `${primary}18`,
                      borderColor: primary,
                    },
                  }}
                >
                  Login
                </Button>
              </Link>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 260, background: bg },
        }}
      >
        {drawerContent}
      </Drawer>

      <Toolbar sx={{ minHeight: "66px" }} />

      {/* Modal Carteirinha de Estudante */}
      <Dialog
        open={openCarteirinha}
        onClose={() => setOpenCarteirinha(false)}
        PaperProps={{
          sx: {
            background: bg,
            border: `1px solid ${primary}22`,
            borderRadius: 3,
            color: "white",
            maxWidth: 440,
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1, fontFamily: "'Inclusive Sans', sans-serif" }}>
          Carteirinha de Estudante
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          {loadingCarteirinha ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: primary }} />
            </Box>
          ) : (
            /* Cartão estilo crachá */
            <Box sx={{
              background: `linear-gradient(135deg, ${primary}cc, ${primary}66)`,
              borderRadius: 2,
              p: "1.3em",
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              boxShadow: "3px 3px 18px rgba(0,0,0,0.5)",
              minHeight: 160,
            }}>
              {/* Dados */}
              <Box sx={{ flex: 1, wordBreak: "break-word" }}>
                {/* Nome da escola */}
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, opacity: 0.75, letterSpacing: "0.08em", textTransform: "uppercase", mb: 1.5 }}>
                  Conecta Portal Escolar
                </Typography>

                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Nome
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 1.5, lineHeight: 1.3 }}>
                  {perfilAluno?.nome_completo || user?.email?.split("@")[0] || "—"}
                </Typography>

                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Matrícula
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "0.1em" }}>
                  {perfilAluno?.matricula || "—"}
                </Typography>
              </Box>

              {/* Foto placeholder */}
              <Box sx={{
                width: 72, height: 96, flexShrink: 0,
                background: "rgba(255,255,255,0.9)",
                borderRadius: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(0,0,0,0.3)", fontSize: "0.75rem", fontWeight: 600,
              }}>
                Foto
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
