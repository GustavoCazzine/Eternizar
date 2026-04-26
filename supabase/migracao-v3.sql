-- Migração Eternizar v3 — garantir todos os campos novos existem
-- Rodar no Supabase Dashboard → SQL Editor

-- Campos novos que podem estar faltando
DO $$
BEGIN
  -- locais (mapa do amor)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paginas' AND column_name='locais') THEN
    ALTER TABLE paginas ADD COLUMN locais jsonb DEFAULT '[]'::jsonb;
    RAISE NOTICE 'locais: ADDED';
  ELSE
    RAISE NOTICE 'locais: EXISTS';
  END IF;

  -- bucket_list
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paginas' AND column_name='bucket_list') THEN
    ALTER TABLE paginas ADD COLUMN bucket_list jsonb DEFAULT '[]'::jsonb;
    RAISE NOTICE 'bucket_list: ADDED';
  ELSE
    RAISE NOTICE 'bucket_list: EXISTS';
  END IF;

  -- audio_mensagem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paginas' AND column_name='audio_mensagem') THEN
    ALTER TABLE paginas ADD COLUMN audio_mensagem text DEFAULT NULL;
    RAISE NOTICE 'audio_mensagem: ADDED';
  ELSE
    RAISE NOTICE 'audio_mensagem: EXISTS';
  END IF;

  -- musica_dados (em vez de campos separados)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paginas' AND column_name='musica_dados') THEN
    ALTER TABLE paginas ADD COLUMN musica_dados jsonb DEFAULT NULL;
    RAISE NOTICE 'musica_dados: ADDED';
  ELSE
    RAISE NOTICE 'musica_dados: EXISTS';
  END IF;

  -- dados_casal (json com todos os dados do casal)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paginas' AND column_name='dados_casal') THEN
    ALTER TABLE paginas ADD COLUMN dados_casal jsonb DEFAULT NULL;
    RAISE NOTICE 'dados_casal: ADDED';
  ELSE
    RAISE NOTICE 'dados_casal: EXISTS';
  END IF;

  -- compartilhavel (toggle publico/privado)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paginas' AND column_name='compartilhavel') THEN
    ALTER TABLE paginas ADD COLUMN compartilhavel boolean DEFAULT true;
    RAISE NOTICE 'compartilhavel: ADDED';
  ELSE
    RAISE NOTICE 'compartilhavel: EXISTS';
  END IF;

  -- email_destinatario
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paginas' AND column_name='email_destinatario') THEN
    ALTER TABLE paginas ADD COLUMN email_destinatario text DEFAULT NULL;
    RAISE NOTICE 'email_destinatario: ADDED';
  ELSE
    RAISE NOTICE 'email_destinatario: EXISTS';
  END IF;

  -- hospedagem_vitalicia
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paginas' AND column_name='hospedagem_vitalicia') THEN
    ALTER TABLE paginas ADD COLUMN hospedagem_vitalicia boolean DEFAULT false;
    RAISE NOTICE 'hospedagem_vitalicia: ADDED';
  ELSE
    RAISE NOTICE 'hospedagem_vitalicia: EXISTS';
  END IF;

  -- fonte_par (mantido para backward compat, sempre 'classico')
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paginas' AND column_name='fonte_par') THEN
    ALTER TABLE paginas ADD COLUMN fonte_par text DEFAULT 'classico';
    RAISE NOTICE 'fonte_par: ADDED';
  ELSE
    RAISE NOTICE 'fonte_par: EXISTS';
  END IF;
END$$;
