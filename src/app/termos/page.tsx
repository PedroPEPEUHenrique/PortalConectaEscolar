"use client";

import { Box, Typography, Container } from "@mui/material";

export default function TermosDeUso() {
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
          Termos de Uso
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
            "& a": { color: "#00ff99", textDecoration: "none", "&:hover": { textDecoration: "underline" } }
          }}
        >
          <p>
            Bem-vindo ao <strong>PortalConectaEscolar</strong>. Ao acessar e utilizar esta plataforma, você concorda expressamente com os presentes Termos de Uso. Leia-os atentamente antes de navegar, enviar arquivos ou interagir nas áreas da comunidade.
          </p>

          <h2>1. Descrição do Serviço</h2>
          <p>
            O PortalConectaEscolar é uma plataforma digital projetada para facilitar a gestão acadêmica. O ambiente oferece aos alunos, professores, gestores e administradores ferramentas para o gerenciamento de Atividades Acadêmicas (incluindo anexos em PDF), Calendário Escolar e um mural da Comunidade.
          </p>

          <h2>2. Cadastro e Níveis de Acesso</h2>
          <p>
            O acesso ao portal requer autenticação válida e vinculada à instituição. As permissões de navegação, edição e exclusão de conteúdo são estritamente controladas com base na sua função (Perfil):
          </p>
          <ul>
            <li><strong>Alunos e Professores:</strong> Possuem acessos restritos às suas respectivas atividades curriculares. Alunos atuam majoritariamente como visualizadores de eventos e murais institucionais.</li>
            <li><strong>Gestores e Administradores:</strong> Possuem privilégios elevados para a organização do calendário e da comunidade escolar.</li>
            <li>Você é o único responsável por manter a confidencialidade de suas credenciais de acesso, sendo vedado o compartilhamento de senhas.</li>
          </ul>

          <h2>3. Regras de Conduta</h2>
          <p>
            Ao utilizar o PortalConectaEscolar, especialmente as seções interativas como a <strong>Comunidade</strong> e o envio de <strong>Atividades</strong>, você se compromete a:
          </p>
          <ul>
            <li>Não enviar arquivos maliciosos, vírus, malwares ou qualquer tecnologia que possa prejudicar o funcionamento da plataforma.</li>
            <li>Utilizar linguagem adequada e respeitosa, abstendo-se de publicar conteúdos ofensivos, discriminatórios, difamatórios ou ilícitos.</li>
            <li>Enviar exclusivamente documentos (como PDFs) pertinentes ao contexto acadêmico e de sua própria autoria ou de fontes devidamente citadas.</li>
          </ul>

          <h2>4. Propriedade Intelectual</h2>
          <p>
            Todo o layout, código-fonte, bases de dados e identidade visual da plataforma são de propriedade exclusiva do PortalConectaEscolar. Os materiais acadêmicos e arquivos inseridos pelos professores e gestores continuam sob a titularidade intelectual de seus respectivos autores.
          </p>

          <h2>5. Modificações na Plataforma e nos Termos</h2>
          <p>
            A administração do sistema reserva-se o direito de realizar manutenções, atualizações e modificações nas funcionalidades do portal a qualquer momento, sem aviso prévio. Da mesma forma, estes Termos de Uso poderão ser revisados e atualizados, cabendo ao usuário revisá-los periodicamente.
          </p>

          <h2>6. Suspensão de Acesso</h2>
          <p>
            O descumprimento de qualquer uma das regras estabelecidas nestes Termos ou na Política de Privacidade poderá resultar na suspensão temporária ou no cancelamento definitivo do acesso do usuário ao portal, sem prejuízo das sanções legais cabíveis.
          </p>

          <p style={{ marginTop: "40px", fontStyle: "italic", textAlign: "center" }}>
            Ao continuar utilizando o PortalConectaEscolar, você declara ter lido, compreendido e aceitado todos os termos e condições descritos acima.
          </p>

        </Box>
      </Container>
    </Box>
  );
}