"use client";

import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { darkTheme } from "@/theme/theme";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            background: "radial-gradient(circle at top, #0f2027, #111827 60%)",
          }}
        >
          {/* A Navbar fica aqui dentro para ter acesso ao usuário logado */}
          <Navbar />
          
          <Box sx={{ flex: 1 }}>{children}</Box>
          
          <Footer />
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}