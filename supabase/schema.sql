-- =============================================================================
-- Portal Conecta Escolar — Schema do Banco de Dados Supabase
-- =============================================================================
-- Como usar:
--   1. Acesse seu projeto em https://supabase.com
--   2. Vá em SQL Editor → New query
--   3. Cole este arquivo inteiro e clique em Run
-- =============================================================================


-- =============================================================================
-- EXTENSÕES
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- TABELA: perfis
-- Armazena o cargo/papel de cada usuário autenticado.
-- O campo `id` referencia diretamente o usuário do Supabase Auth.
-- =============================================================================

-- Sequência para gerar números de matrícula únicos (ex: 100001, 100002...)
CREATE SEQUENCE IF NOT EXISTS matricula_seq START 100001;

CREATE TABLE IF NOT EXISTS perfis (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cargo         TEXT NOT NULL DEFAULT 'aluno'
                  CHECK (cargo IN ('aluno', 'professor', 'gestor', 'admin')),
  email         TEXT,
  nome_completo TEXT,
  matricula     TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill: gera matrícula para perfis existentes que ainda não têm
UPDATE perfis SET matricula = LPAD(nextval('matricula_seq')::text, 6, '0') WHERE matricula IS NULL;

-- Trigger: cria um perfil automaticamente quando um novo usuário é cadastrado
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis (id, cargo, email, matricula)
  VALUES (NEW.id, 'aluno', NEW.email, LPAD(nextval('matricula_seq')::text, 6, '0'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =============================================================================
-- TABELA: atividades
-- Tarefas/atividades escolares. Gerenciadas por professores e admins.
-- =============================================================================

CREATE TABLE IF NOT EXISTS atividades (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          TEXT        NOT NULL CHECK (char_length(titulo) <= 200),
  descricao       TEXT        NOT NULL DEFAULT '' CHECK (char_length(descricao) <= 2000),
  status          TEXT        NOT NULL DEFAULT 'Pendente'
                    CHECK (status IN ('Pendente', 'Em andamento', 'Concluído')),
  arquivo_pdf_url TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- TABELA: eventos
-- Calendário escolar. Gerenciado por gestores e admins.
-- =============================================================================

CREATE TABLE IF NOT EXISTS eventos (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  data       TEXT        NOT NULL CHECK (data ~ '^\d{4}-\d{2}-\d{2}$'),
  evento     TEXT        NOT NULL CHECK (char_length(evento) <= 300),
  tipo       TEXT        NOT NULL DEFAULT 'geral' CHECK (char_length(tipo) <= 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- TABELA: comunidade
-- Mural de avisos e mensagens da comunidade escolar.
-- =============================================================================

CREATE TABLE IF NOT EXISTS comunidade (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  autor      TEXT        NOT NULL CHECK (char_length(autor) <= 100),
  mensagem   TEXT        NOT NULL CHECK (char_length(mensagem) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- TABELA: feedbacks
-- Formulário de feedback enviado pelos usuários (somente escrita via app).
-- =============================================================================

CREATE TABLE IF NOT EXISTS feedbacks (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  tipo       TEXT        NOT NULL
               CHECK (tipo IN ('Elogio', 'Sugestão', 'Reclamação', 'Problema Técnico')),
  mensagem   TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Garante que dados só sejam acessados por quem tem permissão.
-- =============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE perfis    ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks  ENABLE ROW LEVEL SECURITY;


-- ─── perfis ───────────────────────────────────────────────────────────────────

-- Qualquer usuário autenticado pode ler todos os perfis (necessário para listar alunos/professores na gestão de turmas)
CREATE POLICY "perfis: leitura autenticada"
  ON perfis FOR SELECT
  TO authenticated
  USING (true);

-- Usuário autenticado atualiza apenas o próprio perfil
CREATE POLICY "perfis: atualização própria"
  ON perfis FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);


-- ─── atividades ───────────────────────────────────────────────────────────────

-- Qualquer pessoa (inclusive anônima) pode visualizar atividades
CREATE POLICY "atividades: leitura pública"
  ON atividades FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apenas usuários autenticados podem criar/editar/excluir
CREATE POLICY "atividades: escrita autenticada"
  ON atividades FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "atividades: edição autenticada"
  ON atividades FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "atividades: exclusão autenticada"
  ON atividades FOR DELETE
  TO authenticated
  USING (true);


-- ─── eventos ──────────────────────────────────────────────────────────────────

CREATE POLICY "eventos: leitura pública"
  ON eventos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "eventos: escrita autenticada"
  ON eventos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "eventos: edição autenticada"
  ON eventos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "eventos: exclusão autenticada"
  ON eventos FOR DELETE
  TO authenticated
  USING (true);


-- ─── comunidade ───────────────────────────────────────────────────────────────

CREATE POLICY "comunidade: leitura pública"
  ON comunidade FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "comunidade: escrita autenticada"
  ON comunidade FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "comunidade: edição autenticada"
  ON comunidade FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "comunidade: exclusão autenticada"
  ON comunidade FOR DELETE
  TO authenticated
  USING (true);


-- ─── feedbacks ────────────────────────────────────────────────────────────────

-- Qualquer pessoa pode enviar feedback (incluindo anônimos)
CREATE POLICY "feedbacks: envio público"
  ON feedbacks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Apenas gestor e admin podem ler os feedbacks
CREATE POLICY "feedbacks: leitura gestor/admin"
  ON feedbacks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfis
      WHERE perfis.id = auth.uid()
        AND perfis.cargo IN ('gestor', 'admin')
    )
  );


-- =============================================================================
-- STORAGE: bucket atividades_pdfs
-- Bucket público para upload de PDFs das atividades.
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'atividades_pdfs',
  'atividades_pdfs',
  true,
  10485760,                   -- limite de 10 MB por arquivo
  ARRAY['application/pdf']    -- somente PDFs
)
ON CONFLICT (id) DO NOTHING;

-- Usuários autenticados podem fazer upload
CREATE POLICY "storage: upload autenticado"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'atividades_pdfs');

-- Qualquer pessoa pode visualizar/baixar os arquivos (bucket público)
CREATE POLICY "storage: leitura pública"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'atividades_pdfs');

-- Usuários autenticados podem excluir arquivos
CREATE POLICY "storage: exclusão autenticada"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'atividades_pdfs');


-- =============================================================================
-- TABELA: turmas
-- Turmas escolares. Criadas e gerenciadas por gestores e admins.
-- =============================================================================

CREATE TABLE IF NOT EXISTS turmas (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT        NOT NULL CHECK (char_length(nome) <= 100),
  descricao  TEXT        NOT NULL DEFAULT '',
  ano_letivo TEXT        NOT NULL CHECK (ano_letivo ~ '^\d{4}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TABELA: turma_alunos
-- Vínculo aluno ↔ turma. Cada aluno pertence a no máximo uma turma (UNIQUE).
-- =============================================================================

CREATE TABLE IF NOT EXISTS turma_alunos (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id   UUID        NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  aluno_id   UUID        NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (aluno_id)
);

-- =============================================================================
-- TABELA: turma_professores
-- Vínculo professor ↔ turma. Professor pode ter várias turmas.
-- =============================================================================

CREATE TABLE IF NOT EXISTS turma_professores (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id     UUID        NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  professor_id UUID        NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (turma_id, professor_id)
);


-- ─── RLS: turmas ─────────────────────────────────────────────────────────────

ALTER TABLE turmas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE turma_alunos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE turma_professores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "turmas: leitura autenticada"
  ON turmas FOR SELECT TO authenticated USING (true);

CREATE POLICY "turmas: escrita gestor/admin"
  ON turmas FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.cargo IN ('gestor', 'admin'))
  );

CREATE POLICY "turmas: edição gestor/admin"
  ON turmas FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.cargo IN ('gestor', 'admin'))
  );

CREATE POLICY "turmas: exclusão gestor/admin"
  ON turmas FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.cargo IN ('gestor', 'admin'))
  );

-- ─── RLS: turma_alunos ───────────────────────────────────────────────────────

CREATE POLICY "turma_alunos: leitura autenticada"
  ON turma_alunos FOR SELECT TO authenticated USING (true);

CREATE POLICY "turma_alunos: escrita gestor/admin"
  ON turma_alunos FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.cargo IN ('gestor', 'admin'))
  );

CREATE POLICY "turma_alunos: exclusão gestor/admin"
  ON turma_alunos FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.cargo IN ('gestor', 'admin'))
  );

-- ─── RLS: turma_professores ──────────────────────────────────────────────────

CREATE POLICY "turma_professores: leitura autenticada"
  ON turma_professores FOR SELECT TO authenticated USING (true);

CREATE POLICY "turma_professores: escrita gestor/admin"
  ON turma_professores FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.cargo IN ('gestor', 'admin'))
  );

CREATE POLICY "turma_professores: exclusão gestor/admin"
  ON turma_professores FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.cargo IN ('gestor', 'admin'))
  );


-- =============================================================================
-- PROMOVER USUÁRIO A ADMIN (executar manualmente após o primeiro cadastro)
-- =============================================================================
--
-- Após criar sua conta pelo sistema de login, execute o comando abaixo
-- substituindo pelo e-mail cadastrado:
--
--   UPDATE perfis
--   SET cargo = 'admin'
--   WHERE id = (
--     SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com'
--   );
--
-- Cargos disponíveis: 'aluno' | 'professor' | 'gestor' | 'admin'
-- =============================================================================
