-- MemorIA — Schema do banco de dados
-- Execute este SQL no Supabase SQL Editor

-- Tabela de pedidos
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('casal', 'formatura', 'homenagem', 'lembrete')),
  email_cliente TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'expirado')),
  valor DECIMAL(10,2) NOT NULL,
  payment_id TEXT,
  pagina_slug TEXT,
  dados_pagina JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de páginas
CREATE TABLE paginas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  subtitulo TEXT DEFAULT '',
  mensagem TEXT NOT NULL,
  musica_nome TEXT DEFAULT '',
  cor_tema TEXT DEFAULT 'pink',
  fotos JSONB DEFAULT '[]',
  linha_do_tempo JSONB DEFAULT '[]',
  senha_hash TEXT,
  ativa BOOLEAN DEFAULT TRUE,
  expira_em TIMESTAMPTZ NOT NULL,
  visualizacoes INTEGER DEFAULT 0,
  email_cliente TEXT NOT NULL,
  criada_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de lembretes
CREATE TABLE lembretes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  descricao TEXT NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  dia INTEGER NOT NULL CHECK (dia BETWEEN 1 AND 31),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_paginas_slug ON paginas(slug);
CREATE INDEX idx_paginas_ativa ON paginas(ativa, expira_em);
CREATE INDEX idx_pedidos_email ON pedidos(email_cliente);
CREATE INDEX idx_pedidos_payment ON pedidos(payment_id);

-- Row Level Security (RLS) — segurança por design
ALTER TABLE paginas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lembretes ENABLE ROW LEVEL SECURITY;

-- Política: páginas ativas são leitura pública (para exibir ao destinatário)
CREATE POLICY "paginas_leitura_publica"
  ON paginas FOR SELECT
  USING (ativa = TRUE AND expira_em > NOW());

-- Políticas de escrita apenas via service role (nossa API server-side)
CREATE POLICY "pedidos_service_role"
  ON pedidos FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "paginas_service_role"
  ON paginas FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "paginas_update_service_role"
  ON paginas FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "lembretes_service_role"
  ON lembretes FOR ALL
  USING (auth.role() = 'service_role');

-- Storage bucket para fotos (execute também)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('fotos', 'fotos', true);
