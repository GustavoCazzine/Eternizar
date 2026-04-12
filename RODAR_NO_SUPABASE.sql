-- ═══════════════════════════════════════════════════════════════════
-- ETERNIZAR — SQL COMPLETO v3 (com autenticação)
-- Rodar TUDO de uma vez no Supabase → SQL Editor
-- Seguro pra rodar múltiplas vezes (IF NOT EXISTS + ADD COLUMN IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════════════


-- ─── 1. TABELA: paginas ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS paginas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  mensagem TEXT NOT NULL,
  musica_nome TEXT,
  musica_dados JSONB,
  cor_tema TEXT DEFAULT 'pink',
  fotos JSONB DEFAULT '[]'::jsonb,
  linha_do_tempo JSONB DEFAULT '[]'::jsonb,
  senha_hash TEXT,
  senha_dica TEXT,
  dados_casal JSONB,
  dados_formatura JSONB,
  ativa BOOLEAN DEFAULT true,
  expira_em TIMESTAMPTZ,
  hospedagem_vitalicia BOOLEAN DEFAULT false,
  visualizacoes INTEGER DEFAULT 0,
  email_cliente TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Colunas que podem não existir (seguro rodar em tabelas existentes)
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS musica_dados JSONB;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS senha_dica TEXT;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS dados_casal JSONB;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS dados_formatura JSONB;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS hospedagem_vitalicia BOOLEAN DEFAULT false;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS visualizacoes INTEGER DEFAULT 0;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS email_cliente TEXT;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS ativa BOOLEAN DEFAULT true;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS fonte_par TEXT DEFAULT 'classico';
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS compartilhavel BOOLEAN DEFAULT true;

-- Índices
CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug);
CREATE INDEX IF NOT EXISTS idx_paginas_ativa ON paginas(ativa) WHERE ativa = true;
CREATE INDEX IF NOT EXISTS idx_paginas_user_id ON paginas(user_id) WHERE user_id IS NOT NULL;


-- ─── 2. TABELA: pedidos ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  email_cliente TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  valor NUMERIC NOT NULL,
  payment_id TEXT,
  dados_pagina JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ─── 3. TABELA: mensagens_visita (Guestbook) ────────────────────
CREATE TABLE IF NOT EXISTS mensagens_visita (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  nome TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  aprovado BOOLEAN DEFAULT false,
  pagina_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mensagens_visita ADD COLUMN IF NOT EXISTS aprovado BOOLEAN DEFAULT false;
ALTER TABLE mensagens_visita ADD COLUMN IF NOT EXISTS pagina_user_id UUID;

CREATE INDEX IF NOT EXISTS idx_mensagens_visita_slug ON mensagens_visita(slug);
CREATE INDEX IF NOT EXISTS idx_mensagens_visita_created ON mensagens_visita(created_at);
CREATE INDEX IF NOT EXISTS idx_msg_aprovado ON mensagens_visita(slug, aprovado);


-- ─── 4. TABELA: lembretes (futuro) ──────────────────────────────
CREATE TABLE IF NOT EXISTS lembretes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  nome_evento TEXT NOT NULL,
  data_evento DATE NOT NULL,
  dias_antes INTEGER DEFAULT 3,
  enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

-- ─── paginas ─────────────────────────────────────────────────────
ALTER TABLE paginas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Paginas leitura publica" ON paginas;
DROP POLICY IF EXISTS "Usuario ve suas paginas" ON paginas;
DROP POLICY IF EXISTS "Usuario edita suas paginas" ON paginas;

-- Público vê ativas OU dono vê todas as suas
CREATE POLICY "Paginas leitura" ON paginas
  FOR SELECT USING (
    ativa = true
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- Dono pode editar suas páginas
CREATE POLICY "Paginas edicao dono" ON paginas
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- INSERT e DELETE = somente service_role (API backend)

-- ─── pedidos ─────────────────────────────────────────────────────
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
-- Zero policies = somente service_role

-- ─── mensagens_visita ────────────────────────────────────────────
ALTER TABLE mensagens_visita ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mensagens leitura publica" ON mensagens_visita;
DROP POLICY IF EXISTS "Mensagens escrita publica" ON mensagens_visita;

CREATE POLICY "Mensagens leitura" ON mensagens_visita
  FOR SELECT USING (true);

CREATE POLICY "Mensagens escrita" ON mensagens_visita
  FOR INSERT WITH CHECK (
    char_length(nome) BETWEEN 1 AND 50
    AND char_length(mensagem) BETWEEN 1 AND 300
  );

-- ─── lembretes ───────────────────────────────────────────────────
ALTER TABLE lembretes ENABLE ROW LEVEL SECURITY;
-- Zero policies = somente service_role


-- ═══════════════════════════════════════════════════════════════════
-- PRONTO! Agora configure o Google Auth no Dashboard.
-- ═══════════════════════════════════════════════════════════════════
