-- ═══════════════════════════════════════════════════════════════════
-- SQL COMPLETO PARA O ETERNIZAR (v2 — com segurança reforçada)
-- Rodar no Supabase → SQL Editor
-- Seguro pra rodar múltiplas vezes (IF NOT EXISTS em tudo)
-- ═══════════════════════════════════════════════════════════════════


-- ─── 1. TABELA: paginas ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS paginas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('casal', 'formatura', 'homenagem', 'lembrete')),
  titulo TEXT NOT NULL CHECK (char_length(titulo) BETWEEN 1 AND 200),
  subtitulo TEXT CHECK (char_length(subtitulo) <= 300),
  mensagem TEXT NOT NULL CHECK (char_length(mensagem) BETWEEN 1 AND 2000),
  musica_nome TEXT,
  musica_dados JSONB,
  cor_tema TEXT DEFAULT 'pink' CHECK (cor_tema IN ('pink', 'violet', 'amber', 'blue', 'emerald', 'rose')),
  fotos JSONB DEFAULT '[]'::jsonb,
  linha_do_tempo JSONB DEFAULT '[]'::jsonb,
  senha_hash TEXT,
  senha_dica TEXT CHECK (char_length(senha_dica) <= 200),
  dados_casal JSONB,
  dados_formatura JSONB,
  ativa BOOLEAN DEFAULT true,
  expira_em TIMESTAMPTZ,
  hospedagem_vitalicia BOOLEAN DEFAULT false,
  visualizacoes INTEGER DEFAULT 0,
  email_cliente TEXT CHECK (char_length(email_cliente) <= 254),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug);
CREATE INDEX IF NOT EXISTS idx_paginas_ativa ON paginas(ativa) WHERE ativa = true;

-- Colunas extras (seguro pra rodar em tabelas existentes)
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS musica_dados JSONB;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS senha_dica TEXT;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS dados_casal JSONB;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS dados_formatura JSONB;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS hospedagem_vitalicia BOOLEAN DEFAULT false;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS visualizacoes INTEGER DEFAULT 0;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS email_cliente TEXT;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS ativa BOOLEAN DEFAULT true;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();


-- ─── 2. TABELA: pedidos ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('casal', 'formatura', 'homenagem', 'lembrete')),
  email_cliente TEXT NOT NULL CHECK (char_length(email_cliente) <= 254),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  valor NUMERIC NOT NULL CHECK (valor > 0 AND valor < 1000),
  payment_id TEXT,
  dados_pagina JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ─── 3. TABELA: mensagens_visita ─────────────────────────────────
CREATE TABLE IF NOT EXISTS mensagens_visita (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL CHECK (char_length(slug) <= 60),
  nome TEXT NOT NULL CHECK (char_length(nome) BETWEEN 1 AND 50),
  mensagem TEXT NOT NULL CHECK (char_length(mensagem) BETWEEN 1 AND 300),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mensagens_visita_slug ON mensagens_visita(slug);
CREATE INDEX IF NOT EXISTS idx_mensagens_visita_created ON mensagens_visita(created_at);


-- ─── 4. TABELA: lembretes ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lembretes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL CHECK (char_length(email) <= 254),
  nome_evento TEXT NOT NULL CHECK (char_length(nome_evento) <= 100),
  data_evento DATE NOT NULL,
  dias_antes INTEGER DEFAULT 3 CHECK (dias_antes BETWEEN 1 AND 30),
  enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY — TODAS AS TABELAS
-- ═══════════════════════════════════════════════════════════════════

-- ─── paginas: SELECT público (ativas), tudo mais só service role ─
ALTER TABLE paginas ENABLE ROW LEVEL SECURITY;

-- Drop e recria policies para garantir estado correto
DROP POLICY IF EXISTS "Paginas leitura publica" ON paginas;
CREATE POLICY "Paginas leitura publica" ON paginas
  FOR SELECT USING (ativa = true);

-- NENHUMA policy de INSERT/UPDATE/DELETE para anon
-- Isso significa que SOMENTE service_role pode inserir/atualizar/deletar
-- O frontend anon key NÃO pode modificar paginas

-- ─── pedidos: ZERO acesso público ────────────────────────────────
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
-- Sem policies = somente service_role acessa

-- ─── mensagens_visita: SELECT e INSERT públicos ──────────────────
ALTER TABLE mensagens_visita ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mensagens leitura publica" ON mensagens_visita;
CREATE POLICY "Mensagens leitura publica" ON mensagens_visita
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mensagens escrita publica" ON mensagens_visita;
CREATE POLICY "Mensagens escrita publica" ON mensagens_visita
  FOR INSERT WITH CHECK (
    char_length(nome) BETWEEN 1 AND 50
    AND char_length(mensagem) BETWEEN 1 AND 300
    AND char_length(slug) <= 60
  );

-- NENHUMA policy de UPDATE/DELETE para mensagens (imutáveis)

-- ─── lembretes: ZERO acesso público ─────────────────────────────
ALTER TABLE lembretes ENABLE ROW LEVEL SECURITY;
-- Sem policies = somente service_role acessa


-- ═══════════════════════════════════════════════════════════════════
-- 6. STORAGE — Políticas do bucket 'fotos'
-- ═══════════════════════════════════════════════════════════════════

-- Rodar APENAS se o bucket já existe (criar via Dashboard se necessário)

-- Leitura pública (fotos são acessíveis por URL)
-- Isso é configurado no Dashboard: Storage > fotos > Public

-- Escrita: bloquear via policy (somente service_role faz upload)
-- No Dashboard: Storage > Policies > fotos
-- Não criar policy de INSERT para anon = somente service_role faz upload


-- ═══════════════════════════════════════════════════════════════════
-- 7. CHECKLIST DE SEGURANÇA PÓS-DEPLOY
-- ═══════════════════════════════════════════════════════════════════
-- [ ] Remover NEXT_PUBLIC_MODO_TESTE do .env
-- [ ] Configurar MERCADOPAGO_ACCESS_TOKEN real
-- [ ] Configurar domínio no Vercel
-- [ ] Verificar que service_role NÃO está exposta no frontend
-- [ ] Verificar Storage bucket policies no Dashboard
-- [ ] Rodar npm audit e corrigir vulnerabilidades
-- [ ] Configurar SENHA_SALT forte no env de produção
-- [ ] Testar webhook do Mercado Pago com sandbox
-- [ ] Verificar que /api/teste/criar retorna 403 sem MODO_TESTE
