# Eternizar — Documentação do Projeto

## Visão Geral

**Eternizar** é uma plataforma SaaS brasileira para criar páginas digitais personalizadas de homenagens — estilo "Spotify Wrapped para casais". O usuário cria uma página via wizard guiado, adiciona fotos, música, timeline de momentos, e compartilha o link/QR Code com quem ama.

**URL:** https://eternizar.vercel.app
**Repositório:** https://github.com/GustavoCazzine/Eternizar
**Status:** MVP online, gratuito, com sistema de autenticação

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.2.1 (App Router) |
| Linguagem | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animações | Framer Motion 12 |
| Banco de dados | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth + Magic Link) |
| Storage | Supabase Storage (bucket `fotos`) |
| Ícones | Lucide React |
| QR Code | qrcode |
| Música | iTunes Search API (gratuita, preview 30s) |
| Pagamento | Mercado Pago Pix (configurado, desativado) |
| Hosting | Vercel |
| Fontes | Outfit (body) |

---

## Estrutura de Arquivos

```
memoria-app/
├── public/
│   └── logo.png                          # Logo Eternizar (43KB, sem fundo)
│
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Landing page premium
│   │   ├── layout.tsx                    # Layout raiz (fonts + metadata)
│   │   ├── globals.css                   # Variáveis CSS + classes utilitárias
│   │   │
│   │   ├── criar/page.tsx                # Wizard de criação (8 passos)
│   │   ├── sucesso/page.tsx              # Pós-criação (QR + compartilhamento)
│   │   ├── demo/page.tsx                 # Página de exemplo (usa PaginaCliente com mock)
│   │   │
│   │   ├── entrar/page.tsx               # Login (Google + Magic Link)
│   │   ├── painel/
│   │   │   ├── page.tsx                  # Server component (busca páginas do user)
│   │   │   └── PainelCliente.tsx         # Dashboard "Minhas Homenagens"
│   │   │
│   │   ├── p/[slug]/
│   │   │   ├── page.tsx                  # Server (busca + incrementa views)
│   │   │   └── PaginaCliente.tsx         # Componente principal (hero, stories, timeline, guestbook)
│   │   │
│   │   ├── pagamento/[id]/page.tsx       # Tela de Pix (preparada, não ativa)
│   │   │
│   │   ├── auth/callback/route.ts        # OAuth callback
│   │   │
│   │   └── api/
│   │       ├── criar/route.ts            # POST: cria página (rate limit + validação)
│   │       ├── guestbook/route.ts        # GET/POST mensagens do livro de visitas
│   │       ├── hospedagem/route.ts       # POST: ativa hospedagem vitalícia (grátis)
│   │       ├── musica/route.ts           # GET: proxy iTunes Search API
│   │       ├── pedidos/route.ts          # POST: cria pedido (pagamento)
│   │       ├── auth/signout/route.ts     # POST: logout
│   │       ├── paginas/verificar-senha/  # POST: verifica senha da página
│   │       ├── pagamento/
│   │       │   ├── gerar/route.ts        # POST: gera QR Pix no Mercado Pago
│   │       │   ├── status/route.ts       # GET: polling do status
│   │       │   └── webhook/route.ts      # POST: webhook MP (confirma pagamento)
│   │       └── teste/criar/route.ts      # [legacy] rota antiga bloqueada
│   │
│   ├── components/
│   │   ├── StoriesViewer.tsx             # Fullscreen stories (swipe, hold, double-tap)
│   │   ├── CapaInstagram.tsx             # Gerador de capa 1080x1920
│   │   ├── BuscaMusica.tsx               # Busca iTunes com preview
│   │   └── EmojiAnimado.tsx              # Emoji com pulse CSS
│   │
│   ├── lib/
│   │   ├── supabase.ts                   # Client admin (service_role, server-only)
│   │   ├── supabase-browser.ts           # Client para components 'use client'
│   │   ├── supabase-server.ts            # Client para Server Components
│   │   ├── auth.ts                       # getAuthUser() para APIs
│   │   └── security.ts                   # Sanitize, validate, rate limit
│   │
│   └── middleware.ts                     # Auth middleware (renova sessão + protege /painel)
│
├── .env.local                            # Variáveis locais (NÃO commitado)
├── .gitignore                            # Inclui .env*
├── next.config.ts                        # Remote patterns + ignore build errors
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
│
├── RODAR_NO_SUPABASE.sql                 # SQL completo (schema + RLS)
├── CONTEXTO_PROJETO.md                   # Contexto resumido do projeto
├── DIRETIVAS_IA.md                       # Regras pra assistente de IA
├── REGRAS_VISUAIS.md                     # Identidade visual documentada
└── DOCUMENTACAO.md                       # Este arquivo
```

---

## Banco de Dados

### Tabelas

**`paginas`** — Páginas criadas pelos usuários
- `id` (UUID PK), `slug` (unique), `tipo` (casal/formatura/homenagem)
- `titulo`, `subtitulo`, `mensagem`
- `musica_dados` (JSONB: nome, artista, album, capa, previewUrl)
- `cor_tema` (pink/violet/amber/blue/emerald/rose)
- `fotos` (JSONB: [{url, legenda, isCapa}])
- `linha_do_tempo` (JSONB: [{data, titulo, descricao, emoji, fotoUrl}])
- `senha_hash`, `senha_dica` (opcional)
- `dados_casal`, `dados_formatura` (JSONB específico por tipo)
- `ativa`, `expira_em`, `hospedagem_vitalicia`
- `visualizacoes`, `email_cliente`
- **`user_id`** (FK para auth.users) — vincula ao usuário autenticado

**`mensagens_visita`** — Livro de visitas (guestbook)
- `id`, `slug`, `nome`, `mensagem`, `created_at`

**`pedidos`** — Pedidos de pagamento (preparado, não ativo)
- `id`, `tipo`, `email_cliente`, `status`, `valor`, `payment_id`, `dados_pagina`

**`lembretes`** — Lembretes por email (futuro)
- `id`, `email`, `nome_evento`, `data_evento`, `dias_antes`

### Row Level Security (RLS)

- **paginas:** SELECT público em páginas ativas OU dono vê todas as suas; UPDATE só o dono; INSERT/DELETE só service_role
- **pedidos:** Zero acesso público (só service_role)
- **mensagens_visita:** SELECT público, INSERT público com CHECK (nome 1-50, msg 1-300)
- **lembretes:** Zero acesso público

---

## Sistema de Autenticação

### Fluxo

1. Usuário clica "Entrar" na navbar → `/entrar`
2. Opções: **Google OAuth** ou **Magic Link por email**
3. Após login, callback em `/auth/callback` troca o code por sessão
4. Sessão armazenada em **httpOnly cookies** (imune a XSS)
5. Middleware renova o JWT automaticamente em cada request
6. Rota `/painel` protegida — sem login, redireciona pra `/entrar`

### Arquivos de Auth

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/middleware.ts` | Renova sessão, protege `/painel/*` |
| `src/lib/supabase-browser.ts` | Client browser com cookies |
| `src/lib/supabase-server.ts` | Client server com cookies httpOnly |
| `src/lib/auth.ts` | `getAuthUser(req)` — verifica JWT em APIs |
| `src/app/entrar/page.tsx` | Tela de login premium |
| `src/app/auth/callback/route.ts` | Troca OAuth code por sessão |
| `src/app/api/auth/signout/route.ts` | Logout |
| `src/app/painel/` | Dashboard do usuário |

---

## Segurança Implementada

### Camadas

1. **Sanitização XSS** — `sanitize()` escapa `<>"'\\` + backticks
2. **Prototype pollution** — `parseJsonSeguro()` bloqueia `__proto__`
3. **Rate limiting** — Todas as rotas de API (5-30 req/min por IP)
4. **Validação backend** — Tipo, cor, email, data, arquivo, tamanho
5. **DB constraints** — CHECK em todas as tabelas
6. **RLS** — Row Level Security ativa em todas as tabelas
7. **Senhas hasheadas** — SHA-256 + salt do env
8. **httpOnly cookies** — Sessões imunes a XSS
9. **SameSite=lax + Secure** — Anti-CSRF em produção
10. **Service role server-only** — Nunca exposta no frontend
11. **Upload seguro** — Whitelist extensão + MIME + tamanho (max 10MB)
12. **Logs sanitizados** — `console.error` só loga `.message`, sem dados sensíveis

### Proteções contra ataques

- ✅ XSS (Cross-Site Scripting)
- ✅ SQL Injection (Supabase ORM, zero queries raw)
- ✅ CSRF (httpOnly cookies + SameSite)
- ✅ Prototype Pollution
- ✅ Path Traversal (slugs sanitizados)
- ✅ Brute Force (rate limiting)
- ✅ Credential Leak (service_role nunca no frontend)
- ✅ Broken Access Control (RLS + auth middleware)

---

## Variáveis de Ambiente

### Desenvolvimento local (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
SENHA_SALT=eternizar_salt_2026_prod_x9k2m
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MODO_TESTE=true
```

### Produção (Vercel)

As mesmas variáveis, **exceto** `NEXT_PUBLIC_MODO_TESTE` (deve ser removida em prod pra bloquear a rota legacy). Configuradas em **Vercel Dashboard → Settings → Environment Variables**.

### Mercado Pago (quando ativar pagamento)

```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
```

---

## Features Implementadas

### Landing Page
- Hero emocional com logo grande, glow orbs animados e partículas
- Cards emocionais (casais, turmas, homenagens)
- Seção "Como funciona" com layout alternado
- Depoimentos com aspas SVG
- CTA final emocional

### Wizard de Criação (8 passos)
1. **Tipo** — Casal, Formatura, Homenagem
2. **Nomes** — Dados específicos do tipo
3. **Fotos** — Capa + galeria stories (até 10)
4. **Timeline** — Momentos com emoji, data, descrição
5. **Música** — Busca iTunes com preview
6. **Detalhes** — Campos opcionais do casal
7. **Mensagem** — Texto principal + senha opcional
8. **Email** — Confirmação e criação

### Página do Cliente (`/p/[slug]`)
- **Hero** com foto de capa em parallax
- **Contador ao vivo** (casal) — anos, meses, dias, horas, min, seg
- **Cards informativos** (glassmorphism)
- **Stories fullscreen** (Instagram-like)
  - Swipe horizontal
  - Hold-to-pause
  - Double-tap to like
  - Barras de progresso
  - Auto-advance
- **Timeline** com linha vertical animada
- **Player de música** (estilo Spotify) com preview 30s
- **Mensagem final** com aspas SVG decorativas
- **Seção de encerramento** ("Este não é o fim...")
- **Livro de visitas** (guestbook)
- **Senha opcional** com tela de acesso

### Sucesso
- QR Code com cor do tema (download)
- Link exclusivo
- Botão "Gerar Arte para Instagram Stories" (Canvas 1080x1920)
- Ativação de hospedagem vitalícia
- Stats de visualização

### Painel (usuários logados)
- Lista de páginas criadas
- Thumbnail, título, subtítulo, visualizações, data
- Status (Ativa / Expirada / Permanente)
- Link externo pra abrir cada página
- Botão "Nova Homenagem"
- Avatar + logout

---

## Design System

### Paleta
- **Background:** `#08080c` (preto profundo)
- **Primária:** `#ff2d78` (rosa)
- **Secundária:** `#c850c0` (magenta)
- **Tema dinâmico:** 6 cores (pink, violet, amber, blue, emerald, rose)

### Elementos de marca
- **Partículas flutuantes** (5-8 pontos animados)
- **Glow orbs pulsantes** (blur-3xl com animação scale/opacity)
- **Aspas SVG decorativas** (marca registrada)
- **Ícones Lucide** (zero emojis em UI estrutural)
- **Glassmorphism** (`bg-white/[0.03]` + `backdrop-blur-md`)
- **Gradientes radiais** por tipo de seção

### Tipografia
- **Fonte principal:** Outfit (300-800)
- **Hierarquia:** Títulos `text-2xl`→`text-6xl` bold/extrabold
- **Tracking:** Labels em `uppercase tracking-[0.25em]`

---

## Deploy

### Automático
Cada `git push` na branch `main` dispara deploy automático no Vercel.

### Manual
```bash
npx vercel --prod
```

### Primeira configuração
1. Criar projeto no Vercel importando do GitHub
2. Configurar env vars em Settings → Environment Variables
3. Deploy automático inicia

---

## Roadmap

### Feito ✅
- [x] Landing page premium
- [x] Wizard de criação
- [x] Página do cliente com todos os recursos
- [x] Stories com interações (swipe, hold, like)
- [x] Sistema de senha
- [x] Guestbook
- [x] Hospedagem vitalícia
- [x] Visual premium consistente
- [x] Segurança completa (RLS, sanitize, rate limit)
- [x] Deploy no Vercel
- [x] Sistema de autenticação (Google + Magic Link)
- [x] Painel do usuário

### Próximos passos 🚧
- [ ] Configurar Google OAuth no Supabase Dashboard
- [ ] Edição de páginas no painel
- [ ] Rascunhos (criar sem login, publicar depois com login)
- [ ] Analytics (quem abriu, quando, quantas vezes)
- [ ] Notificação por email quando alguém abrir
- [ ] Mais temas visuais
- [ ] Exportar como PDF/vídeo
- [ ] Modelo freemium (plano grátis limitado + pago ilimitado)
- [ ] Ativar pagamento Mercado Pago (quando tiver volume)
- [ ] Domínio próprio personalizado
- [ ] Viral loop (link "Crie a sua" nas páginas)

---

## Scripts

```bash
# Desenvolvimento
npm run dev              # Servidor local (porta 3000)

# Build
npm run build            # Build de produção
npm run start            # Serve build localmente

# Lint
npm run lint             # ESLint

# Deploy
git push                 # Deploy automático no Vercel
npx vercel --prod        # Deploy manual
npx vercel env ls        # Lista env vars
npx vercel env add NOME  # Adiciona env var
```

---

## Contatos e Links

- **Repositório:** https://github.com/GustavoCazzine/Eternizar
- **Produção:** https://eternizar.vercel.app
- **Dashboard Vercel:** https://vercel.com/cazzinegs-projects/eternizar
- **Dashboard Supabase:** https://supabase.com/dashboard/project/qttumwvxlugxpqpacgvv

---

*Documentação gerada para o projeto Eternizar — última atualização após implementação do sistema de autenticação.*
