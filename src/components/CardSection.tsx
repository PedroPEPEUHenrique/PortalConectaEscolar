"use client";

import Grid from "@mui/material/Grid";
// Componente Grid do Material UI para criar layouts responsivos.

import { Card, CardContent, Typography, Box } from "@mui/material";
// Importação dos componentes


export default function CardSection({ title }: { title: string }) {
  // O componente recebe um "title" do tipo string

  return (
    // Container principal com classes CSS
    <Box className="container mt-5">
      
      {/* Título da seção */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        {title}
        {/* Exibe o título recebido como propriedade */}
      </Typography>

      {/* Container do Grid */}
      <Grid container spacing={4}>
        {/* spacing={4} define o espaçamento entre os itens */}

        {/* Criação de 4 cards usando map */}
        {[1, 2, 3, 4].map((item) => (
          
          <Grid
            key={item} // Chave única obrigatória no React
            size={{ xs: 12, sm: 6, md: 6, lg: 3 }}
            // Responsividade:
            // xs = 12 (ocupa toda largura no celular)
            // sm = 6  (metade da tela no tablet)
            // md = 6  (metade da tela em telas médias)
            // lg = 3  (um quarto da tela no desktop grande)
          >
            
            {/* Card individual */}
            <Card
              sx={{
                borderRadius: 4, // Bordas arredondadas
                boxShadow: 6,    // Sombra do card
                height: "100%",  // Altura total disponível
                transition: "0.3s ease", // Animação suave

                // Efeito ao passar o mouse
                "&:hover": {
                  transform: "translateY(-8px)", 
                  // Move o card levemente para cima
                },
              }}
            >
              
              {/* Conteúdo interno do card */}
              <CardContent>

                {/* Título do card */}
                <Typography variant="h6" fontWeight="bold">
                  Card {item}
                  {/* Exibe o número do card */}
                </Typography>

                {/* Texto abaixo do título */}
                <Typography variant="body2" mt={1}>
                  Texto
                </Typography>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}