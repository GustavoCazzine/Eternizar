-- Migração: novos campos para Eternizar v2
-- Rodar no SQL Editor do Supabase

-- Locais para o Mapa do Amor
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS locais jsonb DEFAULT '[]'::jsonb;
-- Formato: [{"titulo":"Onde nos conhecemos","descricao":"...","lat":-23.5,"lng":-46.6,"fotos":["url1","url2"]}]

-- Bucket List
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS bucket_list jsonb DEFAULT '[]'::jsonb;
-- Formato: [{"texto":"Morar juntos","feito":true},{"texto":"Conhecer a Itália","feito":false}]

-- Áudio da mensagem (cápsula de áudio)
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS audio_mensagem text DEFAULT '';
-- URL do áudio de voz uploadado

-- Índices
CREATE INDEX IF NOT EXISTS idx_paginas_tipo ON paginas(tipo);
