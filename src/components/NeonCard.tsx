"use client";

import { Card } from "@mui/material";
import { motion } from "framer-motion";

export default function NeonCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      // 🔥 Garante que a animação não quebre a altura se o card estiver dentro de um Grid
      style={{ height: "100%" }} 
    >
      <Card
        sx={{
          // 🔥 Padding menor no celular (xs: 3) e padrão no PC (md: 4)
          p: { xs: 3, md: 4 }, 
          borderRadius: 1,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 25px rgba(0,255,153,0.15)", // Sombra inicial um pouco mais suave
          transition: "all 0.3s ease-in-out", // "all" garante que borda e movimento também animem
          height: "100%", // Ocupa todo o espaço da motion.div
          
          "&:hover": {
            // 🔥 A borda também acende em verde neon junto com a sombra!
            border: "1px solid rgba(0,255,153,0.5)",
            boxShadow: "0 0 40px rgba(0,255,153,0.5)",
            transform: "translateY(-5px)", // Dá uma leve subidinha para dar sensação de clique
          },
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
}