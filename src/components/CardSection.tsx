"use client";

import Grid from "@mui/material/Grid"; // Componente Grid do Material UI
import { Card, CardContent, Typography, Box } from "@mui/material";

export default function CardSection({ title }: { title: string }) {
  return (
    <Box sx={{ mt: 5, mb: 5, width: "100%" }}>
      
      {/* Título da seção */}
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: "white", mb: 4 }}>
        {title}
      </Typography>

      {/* Container do Grid */}
      <Grid container spacing={4}>
        
        {/* Criação de 4 cards usando map */}
        {[1, 2, 3, 4].map((item) => (
          
          <Grid
            item // 
            key={item}
            // 🟢 
            xs={12}
            sm={6}
            md={6}
            lg={3}
          >
            
            {/* Card individual com o tema Dark Neon do seu projeto */}
            <Card
              sx={{
                background: "rgba(255,255,255,0.05)", // Fundo de vidro
                border: "1px solid rgba(0,255,153,0.3)", // Borda neon sutil
                backdropFilter: "blur(14px)",
                color: "white",
                borderRadius: 1,
                height: "100%", 
                minHeight: "180px", // Garante um tamanho mínimo mesmo se tiver pouco texto
                transition: "all 0.3s ease", 

                // Efeito ao passar o mouse
                "&:hover": {
                  transform: "translateY(-8px)", 
                  boxShadow: "0 0 25px rgba(0,255,153,0.4)", // Brilho neon no hover
                  borderColor: "#00ff99",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#00ff99" }}>
                  Card {item}
                </Typography>

                <Typography variant="body2" mt={2} sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                  Este é um texto de exemplo para o card {item}. Ele se ajusta perfeitamente em telas de todos os tamanhos.
                </Typography>
              </CardContent>
            </Card>
            
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}