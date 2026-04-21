"use client";

import Grid from "@mui/material/Grid";
import { Card, CardContent, Typography, Box } from "@mui/material";

/**
 * Seção de cards de exemplo com grid responsivo.
 * Recebe um título e renderiza 4 cards com efeito glassmorphism.
 */
export default function CardSection({ title }: { title: string }) {
  return (
    <Box sx={{ mt: 5, mb: 5, width: "100%" }}>

      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: "white", mb: 4 }}>
        {title}
      </Typography>

      <Grid container spacing={4}>
        {[1, 2, 3, 4].map((item) => (
          <Grid key={item} size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
            <Card
              sx={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(14px)",
                color: "white",
                borderRadius: "4px",
                height: "100%",
                minHeight: "180px",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  borderColor: "rgba(255,255,255,0.2)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#22c55e" }}>
                  Card {item}
                </Typography>
                <Typography variant="body2" mt={2} sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                  Este é um texto de exemplo para o card {item}. Ele se ajusta em telas de todos os tamanhos.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
