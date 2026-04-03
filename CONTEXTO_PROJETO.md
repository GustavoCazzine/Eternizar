# CONTEXTO DO PROJETO: ETERNIZAR

## O que é
Plataforma SaaS brasileira de presentes digitais personalizados — páginas web interativas estilo "Spotify Wrapped para casais". O cliente cria uma página via wizard, paga via Pix, e compartilha o link/QR Code com quem ama.

## Stack
- **Framework:** Next.js 16.2.1 (App Router) + TypeScript + Tailwind v4
- **Banco:** Supabase (PostgreSQL + Storage bucket `fotos`)
- **Pagamento:** Mercado Pago Pix (configurado, desativado — `NEXT_PUBLIC_MODO_TESTE=true`)
- **Animações:** Framer Motion
- **Fontes:** Outfit (display/body) + Cormorant Garamond (logo)
- **Música:** iTunes Search API (gratuita, sem chave) — preview 30s
- **Hosting:** Local (localhost:3000) — ainda não deployado

## Estrutura de Arquivos
```
C:\Users\User\Documents\memoria-app\src\
├── app\
│   ├── page.tsx                         # Landing page (identidade Eternizar)
│   ├── layout.tsx                       # Layout raiz (fonts Outfit + Cormorant)
│   ├── globals.css                      # Variáveis, classes utilitárias, paleta
│   ├── demo\page.tsx                    # Demo completa da página de casal
│   ├── criar\page.tsx                   # Wizard guiado (8 passos)
│   ├── sucesso\page.tsx                 # Pós-criação: QR Code + Instagram + compartilhamento
│   ├── pagamento\[id]\page.tsx          # Tela de pagamento Pix
│   ├── p\[slug]\
│   │   ├── page.tsx                     # Server component (busca Supabase + expiração)
│   │   └── PaginaCliente.tsx            # Client component — experiência completa + guestbook
│   └── api\
│       ├── pedidos\route.ts             # Cria pedido + inicia pagamento
│       ├── teste\criar\route.ts         # Cria página SEM pagamento (modo teste)
│       ├── musica\route.ts              # Proxy iTunes Search API
│       ├── guestbook\route.ts           # GET/POST mensagens do livro de visitas
│       ├── hospedagem\route.ts          # Ativa hospedagem vitalícia
│       ├── paginas\verificar-senha\route.ts  # Verifica senha da página protegida
│       ├── pagamento\gerar\route.ts     # Gera QR Pix no Mercado Pago
│       ├── pagamento\webhook\route.ts   # Confirma pagamento e ativa página
│       └── pagamento\status\route.ts    # Polling de status
├── components\
│   ├── BuscaMusica.tsx                  # Busca iTunes + preview 30s
│   ├── CapaInstagram.tsx                # Gera imagem 1080x1920 via Canvas
│   ├── EmojiAnimado.tsx                 # Emoji nativo com CSS pulse
│   └── StoriesViewer.tsx                # Viewer fullscreen estilo Instagram
├── lib\
│   ├── supabase.ts                      # Cliente Supabase (anon + admin/service role)
│   └── security.ts                      # Rate limiting, sanitize, gerarSlug
└── types\index.ts
```

## Banco de Dados (Supabase)
```
paginas         — slug, tipo, titulo, subtitulo, mensagem, musica_nome, musica_dados (JSONB),
                  cor_tema, fotos (JSONB), linha_do_tempo (JSONB), dados_casal (JSONB),
                  dados_formatura (JSONB), senha_hash, senha_dica, ativa, expira_em,
                  hospedagem_vitalicia, visualizacoes, email_cliente

pedidos         — id, tipo, email_cliente, status, valor, payment_id, dados_pagina (JSONB)

mensagens_visita — id, slug, nome, mensagem, created_at  (Guestbook)

lembretes       — id, email, nome_evento, data_evento, dias_antes, enviado
```
**Storage:** bucket `fotos` (público)

## Tipos de Página e Preços
| Tipo       | Preço | Duração |
|------------|-------|---------|
| casal      | R$29  | 60 dias |
| formatura  | R$59  | 60 dias |
| homenagem  | R$29  | 60 dias |
| lembrete   | R$15  | 1 ano   |
| Hospedagem Vitalícia (upsell) | +R$49 | Para sempre |

## Fluxo do Usuário
1. **Criação** — wizard 8 passos em `/criar` (tipo → nomes → fotos → timeline → música → detalhes → mensagem → email)
2. **Pagamento** — Pix via Mercado Pago (desativado em modo teste)
3. **Sucesso** — `/sucesso` com QR Code, link copiável, capa Instagram, botão hospedagem vitalícia
4. **Página final** — `/p/[slug]` com hero, contador, cards, stories, timeline, player, mensagem, guestbook

## Seções da Página do Cliente (PaginaCliente.tsx)
1. Hero — emoji + título + subtítulo + parallax + scroll indicator
2. Contador ao vivo — anos/meses/dias/horas/minutos/segundos (só casal)
3. Cards de info — cidade, comida, filme (glassmorphism)
4. Como se conheceram — citação com aspas decorativas
5. Stories — miniaturas com anel gradiente → viewer fullscreen
6. Linha do tempo — linha vertical animada, ícones spring, data pill, fotos
7. Player de música — card estilo Spotify, preview 30s, botão YouTube Music
8. Mensagem final — partículas flutuantes, aspas, coração pulsante
9. Livro de Visitas (Guestbook) — formulário + lista de mensagens
10. Rodapé — "Criado com Eternizar ✨"

## Decisões de Design FIRMES (não re-propor)
- Player de música usa 30s iTunes preview cards (NÃO botões de link)
- Seções usam gradientes per-section com `paleta.fundo`/`paleta.fundoAlt` (NÃO fundo flat)
- Timeline usa linha vertical com ícones animados (NÃO card-style)
- Stories com hold-to-pause e double-tap to like
- QR Code limpo, sem emoji ou logo no centro
- Wizard one-question-per-step com preview panel
- Lottie substituído por emoji nativo + CSS keyframes

## Variáveis de Ambiente (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
MERCADOPAGO_ACCESS_TOKEN=...      ← não configurado
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=... ← não configurado
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MODO_TESTE=true       ← ATIVO
```

## Notas Técnicas (PowerShell)
- O path `C:\Users\User\Documents\memoria-app\src\app\p\[slug]\` causa falha de wildcard no PowerShell — usar `[System.IO.File]::ReadAllText()` / `ReadAllLines()`.
- PowerShell here-strings corrompem template literals JSX com backticks — usar `.Replace()` com strings concatenadas.
- Edits line-based com `ReadAllLines()` + inserção por índice são mais confiáveis que regex pra blocos JSX.

## Status Atual
- ✅ Rebrand completo MemorIA → Eternizar (logo PNG em /public/logo.png)
- ✅ Landing page premium — partículas, glow orbs, aspas SVG, sem preços
- ✅ Wizard premium — progress bar, glow background, passos guiados
- ✅ Sucesso compacta (sem scroll desktop) — QR code limpo
- ✅ Pagamento premium — visual emocional, sem preço agressivo
- ✅ PaginaCliente premium — glassmorphism, partículas, parallax hero com foto
- ✅ Stories com swipe horizontal + hold-to-pause + double-tap like
- ✅ Guestbook (Livro de Visitas) com rate limiting
- ✅ Hospedagem Vitalícia (upsell)
- ✅ Seção de encerramento ("Este não é o fim...")
- ✅ Senha hasheada (SHA-256 + salt) e funcional
- ✅ Validação completa frontend + backend (data, email, tipo, cor, tamanho)
- ✅ Segurança: rate limiting em todas as rotas, XSS sanitize, prototype pollution, RLS
- ✅ DB constraints (CHECK) em todas as tabelas
- ✅ Checkout sem preço visível — CTA "Criar minha homenagem"
- ✅ Bug fixes: useScroll, button-in-button, supabaseAdmin(), QR code cor
- ⏳ Validar assinatura HMAC webhook Mercado Pago (pré-deploy)
- ⏳ Mercado Pago com token real
- ⏳ Deploy no Vercel
- ⏳ Domínio próprio
- ⏳ npm audit antes do deploy