-- ═══════════════════════════════════════════════════════════════════
-- ATUALIZAÇÃO v3 — Sistema de Autenticação
-- Rodar no Supabase SQL Editor APÓS o SQL anterior
-- Seguro pra rodar múltiplas vezes
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Adicionar user_id às páginas ─────────────────────────────
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_paginas_user_id ON paginas(user_id) WHERE user_id IS NOT NULL;

-- ─── 2. Policy: usuário vê SUAS páginas (incluindo inativas) ────
DROP POLICY IF EXISTS "Usuario ve suas paginas" ON paginas;
CREATE POLICY "Usuario ve suas paginas" ON paginas
  FOR SELECT USING (
    ativa = true                              -- Público vê ativas
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())  -- Dono vê todas
  );

-- ─── 3. Policy: usuário edita SUAS páginas ──────────────────────
DROP POLICY IF EXISTS "Usuario edita suas paginas" ON paginas;
CREATE POLICY "Usuario edita suas paginas" ON paginas
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- ─── 4. Recrear policy de leitura pública (substituída) ─────────
DROP POLICY IF EXISTS "Paginas leitura publica" ON paginas;
-- A policy "Usuario ve suas paginas" já cobre leitura pública (ativa = true)


-- ═══════════════════════════════════════════════════════════════════
-- NOTA: INSERT e DELETE continuam sendo SOMENTE via service_role
-- (as APIs do backend fazem insert, não o frontend direto)
-- ═══════════════════════════════════════════════════════════════════
