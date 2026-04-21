"use client";

import { Card } from "@mui/material";
import { motion } from "framer-motion";

/**
 * Card com animação de entrada (fade + slide-up).
 * Usa Framer Motion para a animação e glassmorphism para o fundo translúcido.
 */
export default function NeonCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height: "100%" }}
    >
      <Card
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "4px",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease-in-out",
          height: "100%",
          "&:hover": {
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
            transform: "translateY(-5px)",
          },
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
}
