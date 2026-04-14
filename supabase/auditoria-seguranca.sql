-- ════════════════════════════════════════════════════════════════
-- AUDITORIA DE SEGURANÇA — Eternizar
-- Rodar no SQL Editor do Supabase Dashboard
-- ════════════════════════════════════════════════════════════════

-- 1. Verificar quais tabelas têm RLS ATIVADA
SELECT schemaname, tablename, rowsecurity AS rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Listar policies existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Tabelas SEM nenhuma policy (perigoso se RLS ativo + service_role bypass falhar)
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
WHERE t.schemaname = 'public' AND p.policyname IS NULL;

-- ════════════════════════════════════════════════════════════════
-- POLICIES RECOMENDADAS (executar se faltarem)
-- ════════════════════════════════════════════════════════════════

-- ATIVAR RLS em todas as tabelas
ALTER TABLE paginas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_visita ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- ─── PAGINAS ───────────────────────────────────────────────────
-- Leitura pública só de páginas ativas (frontend usa anon)
DROP POLICY IF EXISTS "leitura_publica_paginas_ativas" ON paginas;
CREATE POLICY "leitura_publica_paginas_ativas" ON paginas
  FOR SELECT TO anon, authenticated
  USING (ativa = true);

-- Dono pode ler tudo (incluindo inativa)
DROP POLICY IF EXISTS "dono_le_propria_pagina" ON paginas;
CREATE POLICY "dono_le_propria_pagina" ON paginas
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Bloqueio total INSERT/UPDATE/DELETE para anon e authenticated
-- (apenas service_role via API server-side pode escrever)
DROP POLICY IF EXISTS "bloqueio_escrita_paginas" ON paginas;
-- (sem CREATE → nenhuma policy permite write → bloqueado por default)

-- ─── MENSAGENS_VISITA ──────────────────────────────────────────
-- Leitura pública só de aprovadas
DROP POLICY IF EXISTS "leitura_publica_aprovadas" ON mensagens_visita;
CREATE POLICY "leitura_publica_aprovadas" ON mensagens_visita
  FOR SELECT TO anon, authenticated
  USING (aprovado = true);

-- Dono lê todas (inclusive pendentes)
DROP POLICY IF EXISTS "dono_le_pendentes" ON mensagens_visita;
CREATE POLICY "dono_le_pendentes" ON mensagens_visita
  FOR SELECT TO authenticated
  USING (pagina_user_id = auth.uid());

-- ─── PEDIDOS ───────────────────────────────────────────────────
-- Bloqueio total — só service_role acessa
-- (sem nenhuma policy = sem acesso para anon/authenticated)

-- ════════════════════════════════════════════════════════════════
-- STORAGE — bucket fotos
-- ════════════════════════════════════════════════════════════════

-- Verificar policies do storage
SELECT * FROM storage.buckets WHERE id = 'fotos';

-- Bucket público para leitura, escrita só via service_role
UPDATE storage.buckets SET public = true WHERE id = 'fotos';

-- Política: anyone pode ler
DROP POLICY IF EXISTS "leitura_publica_fotos" ON storage.objects;
CREATE POLICY "leitura_publica_fotos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'fotos');

-- ════════════════════════════════════════════════════════════════
-- LIMPEZA AUTOMÁTICA — páginas expiradas
-- ════════════════════════════════════════════════════════════════

-- Função para deletar páginas vencidas
CREATE OR REPLACE FUNCTION limpar_paginas_expiradas()
RETURNS void AS $$
BEGIN
  DELETE FROM paginas
  WHERE expira_em IS NOT NULL
    AND expira_em < NOW()
    AND hospedagem_vitalicia = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agendar via pg_cron (extension precisa estar ativada no Supabase)
-- SELECT cron.schedule('limpar-paginas', '0 3 * * *', 'SELECT limpar_paginas_expiradas()');

-- ════════════════════════════════════════════════════════════════
-- ÍNDICES — performance & escalabilidade
-- ════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug);
CREATE INDEX IF NOT EXISTS idx_paginas_user_id ON paginas(user_id);
CREATE INDEX IF NOT EXISTS idx_paginas_ativa_expira ON paginas(ativa, expira_em);
CREATE INDEX IF NOT EXISTS idx_mensagens_slug_aprovado ON mensagens_visita(slug, aprovado);
CREATE INDEX IF NOT EXISTS idx_mensagens_pagina_user ON mensagens_visita(pagina_user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON pedidos(email_cliente);
