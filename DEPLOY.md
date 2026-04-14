# Deploy Eternizar — Vercel

## Pré-deploy (rodar localmente)

```bash
npm ci
npm run audit          # 0 falhas obrigatório
npm run typecheck      # se passar, remover ignoreBuildErrors em next.config.ts
npm run lint
npm run build          # confirmar que builda sem erros
```

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

Marcar **Production + Preview + Development** para cada uma:

| Variável | Onde obter | Crítico |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (secret) | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL do domínio (`https://eternizar.io`) | ✅ |
| `SENHA_SALT` | `openssl rand -hex 32` | ✅ |
| `MERCADOPAGO_ACCESS_TOKEN` | MP Dashboard | ⚠ gateado |
| `UPSTASH_REDIS_REST_URL` | upstash.com (free tier) | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | upstash.com | ✅ |

## Supabase

1. SQL Editor → executar `supabase/auditoria-seguranca.sql`
2. Storage → bucket `fotos` → CORS:
   ```json
   [{"AllowedOrigins":["*"],"AllowedMethods":["GET"],"AllowedHeaders":["*"],"MaxAgeSeconds":3600}]
   ```
3. Authentication → URL Configuration → Site URL = `https://eternizar.io`
4. Authentication → URL Configuration → Redirect URLs = `https://eternizar.io/**`

## Vercel

1. Region: `gru1` (São Paulo) — já em `vercel.json`
2. Domain: adicionar `eternizar.io` + DNS A/CNAME
3. Build & Development Settings → Framework: Next.js (auto)
4. Cron: configurar `/api/health` ping a cada 5min via UptimeRobot

## Pós-deploy

```bash
curl https://eternizar.io/api/health    # deve retornar {"ok":true}
```

Smoke test:
- [ ] `/` carrega < 2s
- [ ] `/criar` formulário funciona
- [ ] `/entrar` Google OAuth redireciona corretamente
- [ ] `/p/[slug-teste]` renderiza + incrementa view
- [ ] `/painel` autenticado → lista páginas
- [ ] `/sucesso` mostra 2 capas (Story + Spotify) + download PNG
- [ ] Modal de capas em `/painel` abre/fecha com ESC
- [ ] Headers de segurança presentes (curl -I https://eternizar.io)

## Rollback

```bash
git tag v-pre-brand
git push --tags
# se quebrar:
vercel rollback
```

## Monitoramento

- **Vercel Analytics**: ativar em Settings → Analytics
- **Vercel Speed Insights**: `npm i @vercel/speed-insights` + adicionar `<SpeedInsights />` no layout
- **UptimeRobot**: monitorar `/api/health` a cada 5min
- **Supabase Logs**: ativar slow query log

## Limites Vercel Free

- 100GB bandwidth/mês
- 100h build/mês
- Função: 10s timeout default (overridado para 30/60s em `vercel.json`)
- Edge: 1M requests/mês

Se ultrapassar → migrar para Pro ($20/mês).
