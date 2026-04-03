# IDENTIDADE VISUAL E UI DO ETERNIZAR (PADRÃO PREMIUM)

O Eternizar é um SaaS de homenagens digitais com visual premium, noturno, imersivo e elegante.

---

## 1. PALETA DE CORES E TEMA GLOBAL

### Fundo
- **Fundo Global:** `#08080c` (quase preto com subtom azulado). Contínuo em todas as páginas.
- **Seções na página do cliente:** usam gradientes suaves per-section com `paleta.fundo` e `paleta.fundoAlt` — NÃO usar cortes bruscos de cor entre seções.
- **Landing/Sucesso:** fundo `#08080c` com orbs de glow rosa (`radial-gradient` com blur 120-150px, opacity 10-20%).

### Cor Primária (Accent)
- **Rosa Eternizar:** `#ff2d78` — usada em botões CTA, bordas ativas, glows, gradientes de texto, QR code.
- **Rosa Light:** `#ff6bae` — usada no shimmer do botão e destaques secundários.
- **Na página do cliente:** a cor é dinâmica, vinda de `paleta.primaria` baseada no `cor_tema` escolhido pelo usuário.

### Paletas por Tema (PaginaCliente.tsx)
```
pink:    primaria #ec4899, secundaria #f43f5e, fundo #1a0010, fundoAlt #2d0018
violet:  primaria #8b5cf6, secundaria #7c3aed, fundo #0d0020, fundoAlt #1e1040
amber:   primaria #f59e0b, secundaria #f97316, fundo #1a1000, fundoAlt #2d1800
blue:    primaria #3b82f6, secundaria #06b6d4, fundo #000d1a, fundoAlt #001830
emerald: primaria #10b981, secundaria #14b8a6, fundo #001a0d, fundoAlt #002d18
rose:    primaria #f43f5e, secundaria #ec4899, fundo #1a0008, fundoAlt #2d0010
```

### Glassmorphism (Efeito Vidro)
- Cards, containers: `bg-white/[0.03]` ou `bg-white/5`, com `backdrop-blur-md` e `border border-white/10`.
- Hover: `border-white/20` ou `border-pink-500/30`.
- Nunca usar fundos sólidos brancos ou cinza claro.

---

## 2. TIPOGRAFIA

### Fontes Configuradas (layout.tsx)
- **Outfit** (`--font-outfit`): Display e body. Pesos 300-800. Usada em títulos, botões, textos.
- **Cormorant Garamond** (`--font-cormorant`): Apenas para o logo "ETERNIZAR". Peso 300, tracking `0.35em`.

### Hierarquia
| Elemento | Classe | Peso |
|----------|--------|------|
| Logo | `font-logo` (Cormorant, tracking 0.35em, weight 300) | Light |
| H1 Hero | `text-4xl sm:text-5xl lg:text-6xl font-extrabold` | 800 |
| H2 Seção | `text-3xl sm:text-4xl font-bold` | 700 |
| H3 Card | `text-lg font-bold` | 700 |
| Tag/Label | `text-xs uppercase tracking-widest` com cor accent | 500 |
| Body | `text-base` ou `text-sm` | 400 |
| Texto muted | `text-zinc-400` ou `text-zinc-500` | 400 |
| Texto hint | `text-zinc-600` | 400 |

### Regras
- **Capitalize:** Nomes de pessoas usam a classe `.nome-capitalize` (`text-transform: capitalize`).
- **Textos xs:** Recebem `font-weight: 500` automaticamente via globals.css pra legibilidade.
- **PROIBIDO** usar Inter, Roboto, Arial, ou system fonts como fonte principal.

---

## 3. ÍCONES VS. EMOJIS (REGRA DE OURO)

### Na UI Estrutural (botões, headers, cards, nav)
- **OBRIGATÓRIO:** Ícones SVG via Lucide React (`lucide-react`).
- Ícones importados: `Heart, Calendar, ArrowDown, Play, Pause, Volume2, Images, MessageCircle, Send, Copy, Download, Share2, ArrowRight, GraduationCap, Star, Bell, Lock, Zap, Shield`.
- Cor dos ícones: herdar do tema ou usar `style={{ color: cor }}`.

### Na Página do Cliente (conteúdo gerado pelo usuário)
- **PERMITIDO:** Emojis nativos do sistema para: emoji da timeline (escolhido pelo usuário), tipo da página (❤️, 🎓, ⭐), e dentro de textos do cliente.
- Emojis animados usam `EmojiAnimado.tsx` com CSS `@keyframes emojiPulse`.

### Na Landing Page e Sucesso
- **PERMITIDO:** Emojis decorativos flutuantes (💖, 🎓, ✨, 🎶) como elementos de ambientação.
- **PROIBIDO** emoji como ícone funcional de botão ou header.

---

## 4. COMPONENTES VISUAIS PADRÃO

### Botão CTA Primário
```tsx
className="btn-shimmer inline-flex items-center gap-2 px-8 py-4 rounded-full
           text-white font-bold text-base shadow-lg shadow-[#ff2d78]/25
           hover:shadow-[#ff2d78]/40 hover:scale-105 transition-transform duration-300"
```
- Usa a animação `shimmer` (gradiente deslizante rosa).
- Sempre `rounded-full`, nunca `rounded-xl` para CTA principal.

### Botão Secundário / Outline
```tsx
className="px-5 py-2 rounded-full text-sm font-semibold text-white
           border border-[#ff2d78] hover:bg-[#ff2d78] transition-all duration-300"
```

### Card Glassmorphism
```tsx
className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6"
```
- Hover: `hover:border-white/20 hover:bg-white/[0.06]`
- SEMPRE `rounded-2xl`, nunca `rounded-lg` pra cards.

### Feature Card (Landing)
```tsx
className="group flex items-center gap-4 px-6 py-5 rounded-2xl
           border border-white/10 bg-white/[0.03] backdrop-blur-md
           hover:border-pink-500/30 hover:bg-white/[0.06] transition-all duration-300"
```

### Input de Formulário
```tsx
className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
           text-white placeholder-gray-600 focus:outline-none transition"
```
- SEMPRE `rounded-xl` pra inputs, nunca `rounded-2xl`.

---

## 5. EFEITOS VISUAIS

### Glow Orbs (Landing + Sucesso)
- Divs absolutas com `blur-[120px]` a `blur-[150px]`, opacity 10-20%.
- Cores: `#ff2d78` (rosa), `#ff69b4` (rosa claro), `#c850c0` (magenta).
- `pointer-events-none`, `z-0`.

### Floating Elements (Corações + Confetti)
- Framer Motion com `animate` multi-keyframe: y, x, rotate, scale.
- Duração 5-8s, `repeat: Infinity`, delays escalonados.
- Opacity 0.5-0.6 pra confetti, 1.0 pra corações.

### Phone Mockups (Landing + Sucesso)
- Frame: `rounded-[36px] bg-gradient-to-b from-zinc-700 to-zinc-900 p-[3px]`.
- Notch: `w-[90px] h-[25px] bg-black rounded-b-2xl`.
- Float animation: `@keyframes float-gentle` com `translateY(-12px)`.
- Sempre com `shadow-2xl shadow-black/50`.

### Scroll Indicator
- Seta SVG com Framer Motion `animate={{ y: [0, 8, 0] }}`.
- Cor accent, texto `text-zinc-500 text-xs tracking-widest uppercase`.

---

## 6. ANIMAÇÕES (FRAMER MOTION)

### Entrada de Elementos
```tsx
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.5, delay: 0.1 }}
```
- Sempre `once: true` no viewport.
- Delay escalonado: 0, 0.1, 0.2 para itens em lista.
- Duração padrão: `0.5` a `0.8`. NUNCA acima de `1.2`.

### Componente Secao (PaginaCliente)
```tsx
initial={{ opacity: 0, y: 60 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: '-60px' }}
transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
```
- Ease custom `[0.22, 1, 0.36, 1]` para feeling premium.
- margin `-60px` para trigger antecipado.

### Timeline Icons
```tsx
initial={{ scale: 0, rotate: -180 }}
whileInView={{ scale: 1, rotate: 0 }}
transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
```

### Hover em Botões
- `hover:scale-105` para CTA principal.
- `hover:bg-white/[0.08]` para botões outline.
- NUNCA usar `whileHover={{ scale }}` do Framer em elementos que já têm Tailwind hover.

---

## 7. RESPONSIVIDADE

### Breakpoints Usados
- `sm:` (640px) — textos maiores, layouts ajustados
- `lg:` (1024px) — grid 2 colunas no hero, preview panel no wizard
- `md:` (768px) — nav links visíveis, grids de cards

### Mobile First
- Navbar: logo + botão "Criar" no mobile, links completos no `md:`.
- Hero: stack vertical no mobile, grid 2 colunas no `lg:`.
- Phone mockups: `w-[200px]` mobile, `w-[220px]` no `sm:`.
- Preview do wizard: botão flutuante no mobile, painel fixo no `lg:`.

---

## 8. CONSISTÊNCIA DE BORDER-RADIUS

| Elemento | Radius |
|----------|--------|
| Botão CTA | `rounded-full` |
| Card | `rounded-2xl` |
| Input/Textarea | `rounded-xl` |
| Badge/Pill | `rounded-full` |
| Phone Mockup | `rounded-[36px]` |
| Imagem/Foto | `rounded-2xl` |
| Ícone container | `rounded-xl` |
| QR Code wrapper | `rounded-2xl` |

NUNCA misturar `rounded-lg` e `rounded-2xl` no mesmo tipo de elemento.
