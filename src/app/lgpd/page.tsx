"use client";

import { Box, Typography, Container, Link as MuiLink } from "@mui/material";
import NextLink from "next/link";

export default function PoliticaPrivacidadeLGPD() {
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
          sx={{ color: "#00ff99", mb: 4, textAlign: "center" }}
        >
          Política de Privacidade (LGPD)
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
            borderRadius: 4,
            border: "1px solid rgba(0,255,153,0.2)",
            "& h2": { color: "#00e5ff", mt: 5, mb: 2, fontSize: "1.5rem" },
            "& p": { color: "rgba(255,255,255,0.8)", lineHeight: 1.8, mb: 2, fontSize: "1rem" },
            "& ul": { color: "rgba(255,255,255,0.8)", mb: 3, pl: 3 },
            "& li": { mb: 1, lineHeight: 1.6 },
          }}
        >
          <p>
            O <strong>PortalConectaEscolar</strong> reafirma seu compromisso com a privacidade e a segurança das informações de seus usuários (alunos, professores, gestores e administradores). Esta Política de Privacidade foi elaborada em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD), visando garantir a transparência sobre como coletamos, utilizamos, armazenamos e protegemos seus dados.
          </p>

          <h2>1. Dados Coletados</h2>
          <p>
            Para o pleno funcionamento da plataforma acadêmica, coletamos apenas os dados estritamente necessários:
          </p>
          <ul>
            <li><strong>Dados de Cadastro e Autenticação:</strong> Nome, endereço de e-mail e credenciais de acesso criptografadas.</li>
            <li><strong>Dados de Perfil e Vínculo Escolar:</strong> Identificação do seu cargo no sistema (ex: Aluno, Professor, Gestor ou Admin) para controle de permissões de acesso (RBAC).</li>
            <li><strong>Dados Acadêmicos (Atividades):</strong> Arquivos enviados (como PDFs de atividades), interações no calendário escolar e postagens na comunidade.</li>
            <li><strong>Dados Técnicos:</strong> Informações de log, endereço IP e dados de navegação básicos necessários para a segurança do ambiente.</li>
          </ul>

          <h2>2. Finalidade do Tratamento dos Dados</h2>
          <p>
            As informações coletadas são utilizadas exclusivamente para fins educacionais e operacionais, incluindo:
          </p>
          <ul>
            <li>Autenticação segura e liberação de acessos restritos conforme o perfil do usuário.</li>
            <li>Gestão de atividades acadêmicas, permitindo o envio, correção e acompanhamento de tarefas e materiais didáticos em anexo.</li>
            <li>Comunicação oficial da instituição de ensino através do painel de avisos e organização do calendário escolar.</li>
            <li>Manutenção da segurança da plataforma e prevenção contra fraudes.</li>
          </ul>

          <h2>3. Compartilhamento de Dados</h2>
          <p>
            O PortalConectaEscolar <strong>não comercializa, aluga ou compartilha</strong> seus dados pessoais com terceiros para fins publicitários. O compartilhamento ocorre apenas com prestadores de serviços de infraestrutura tecnológica estritamente necessários para manter a plataforma no ar (como serviços de nuvem e banco de dados), que também possuem obrigações contratuais de conformidade com a LGPD, ou mediante ordem judicial.
          </p>

          <h2>4. Segurança da Informação</h2>
          <p>
            Adotamos medidas técnicas e administrativas avançadas para proteger seus dados, incluindo:
          </p>
          <ul>
            <li>Comunicação criptografada de ponta a ponta.</li>
            <li>Políticas rigorosas de Segurança em Nível de Linha (Row Level Security) no banco de dados, garantindo que um usuário só tenha acesso às informações pertinentes ao seu cargo.</li>
            <li>Armazenamento seguro de arquivos acadêmicos em <i>buckets</i> protegidos.</li>
          </ul>

          <h2>5. Direitos do Titular dos Dados</h2>
          <p>
            Conforme o Artigo 18 da LGPD, o usuário tem o direito de solicitar a qualquer momento:
          </p>
          <ul>
            <li>Confirmação da existência de tratamento de seus dados.</li>
            <li>Acesso e correção de dados incompletos, inexatos ou desatualizados.</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
            <li>A revogação do consentimento para o uso dos dados.</li>
          </ul>

          <h2>6. Contato e Encarregado de Dados (DPO)</h2>
          <p>
            Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade e o tratamento de seus dados pessoais, entre em contato com nossa equipe de suporte através da nossa central de atendimento.
          </p>
          
          <p style={{ marginTop: "24px" }}>
            <MuiLink 
              component={NextLink} 
              href="/feedback" 
              sx={{ 
                color: "#00ff99", 
                textDecoration: "none", 
                fontWeight: "bold",
                "&:hover": { textDecoration: "underline" } 
              }}
            >
              Acessar o SAC / Suporte
            </MuiLink>
          </p>

        </Box>
      </Container>
    </Box>
  );
}