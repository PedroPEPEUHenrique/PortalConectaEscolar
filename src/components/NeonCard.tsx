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
    >
      <Card
        sx={{
          p: 4,
          borderRadius: 4,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 25px rgba(0,255,153,0.2)",
          transition: "0.3s",
          "&:hover": {
            boxShadow: "0 0 40px rgba(0,255,153,0.5)",
          },
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
}