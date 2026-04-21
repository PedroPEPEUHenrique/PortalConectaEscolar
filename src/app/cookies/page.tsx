"use client";

import { Box, Typography, Container, Link as MuiLink } from "@mui/material";
import NextLink from "next/link";

export default function PoliticaCookies() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        pt: 12,
        pb: 12,
      }}
    >
      <Container maxWidth="md">
        <Typography 
          variant="h3" 
          component="h1" 
          fontWeight="bold" 
          sx={{ color: "#22c55e", mb: 4, textAlign: "center" }}
        >
          Política de Cookies
        </Typography>

        <Typography 
          variant="subtitle1" 
          sx={{ color: "rgba(255,255,255,0.5)", mb: 6, textAlign: "center", fontStyle: "italic" }}
        >
          Última atualização: Março de 2026
        </Typography>

        <Box 
          sx={{ 
            background: "rgba(255,255,255,0.03)", 
            p: { xs: 3, md: 6 }, 
            borderRadius: "4px",
            border: "1px solid rgba(255,255,255,0.1)",
            "& h2": { color: "#60a5fa", mt: 5, mb: 2, fontSize: "1.5rem" },
            "& p": { color: "rgba(255,255,255,0.8)", lineHeight: 1.8, mb: 2, fontSize: "1rem" },
            "& ul": { color: "rgba(255,255,255,0.8)", mb: 3, pl: 3 },
            "& li": { mb: 1, lineHeight: 1.6 },
          }}
        >
          <p>
            O <strong>PortalConectaEscolar</strong> utiliza cookies e tecnologias semelhantes para garantir o funcionamento adequado da plataforma, melhorar a sua experiência de navegação e manter a segurança do seu acesso.
          </p>

          <h2>1. O que são Cookies?</h2>
          <p>
            Cookies são pequenos arquivos de texto armazenados no seu navegador ou dispositivo (computador, smartphone ou tablet) quando você visita o nosso portal. Eles permitem que o sistema memorize suas ações e preferências (como login, perfil de acesso e configurações de interface) por um determinado período.
          </p>

          <h2>2. Como utilizamos os Cookies</h2>
          <p>
            No PortalConectaEscolar, nossa prioridade é a funcionalidade e a segurança educacional. Não utilizamos cookies invasivos de rastreamento publicitário de terceiros. Nossos cookies são focados em:
          </p>
          <ul>
            <li><strong>Cookies Estritamente Necessários:</strong> Essenciais para que você consiga navegar no portal e usar seus recursos. Isso inclui os tokens de sessão que mantêm você logado (autenticado) para acessar suas atividades e o calendário.</li>
            <li><strong>Cookies de Segurança:</strong> Ajudam a autenticar usuários, prevenir o uso fraudulento de credenciais de login e proteger os dados contra acessos não autorizados.</li>
            <li><strong>Cookies de Desempenho e Funcionalidade:</strong> Memorizam as escolhas que você faz para proporcionar uma experiência mais personalizada, como o carregamento otimizado de arquivos PDF e listas de atividades.</li>
          </ul>

          <h2>3. Cookies de Terceiros</h2>
          <p>
            Como utilizamos infraestruturas em nuvem para o banco de dados e armazenamento (ex: Supabase), alguns cookies estritamente técnicos dessas plataformas podem ser instalados para garantir a disponibilidade, escalabilidade e segurança da aplicação. Nenhum desses cookies tem finalidade comercial ou de venda de dados.
          </p>

          <h2>4. Gerenciamento de Cookies</h2>
          <p>
            Você tem o direito de aceitar, recusar ou excluir os cookies. A maioria dos navegadores da web aceita cookies automaticamente, mas você pode modificar as configurações do seu navegador para recusá-los, se preferir.
          </p>
          <p>
            No entanto, alertamos que, por se tratar de um ambiente acadêmico restrito, a desativação de <strong>cookies estritamente necessários</strong> impedirá a realização do login e o acesso às áreas de &quot;Atividades&quot;, &quot;Calendário&quot; e &quot;Comunidade&quot;.
          </p>

          <h2>5. Dúvidas</h2>
          <p>
            Caso tenha qualquer dúvida sobre o uso de cookies na nossa plataforma, sinta-se à vontade para entrar em contato conosco pelo nosso SAC.
          </p>
          
          <p style={{ marginTop: "24px" }}>
            <MuiLink
              component={NextLink} 
              href="/feedback" 
              sx={{ 
                color: "#22c55e",
                textDecoration: "none",
                fontWeight: "bold",
                "&:hover": { textDecoration: "underline" }
              }}
            >
              Ir para a página de Contato / SAC
            </MuiLink>
          </p>

        </Box>
      </Container>
    </Box>
  );
}