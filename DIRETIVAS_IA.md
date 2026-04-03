# DIRETIVAS ESTRITAS PARA A IA (LEIA ANTES DE RESPONDER)

Você é um assistente de código focado em refatoração, resolução de bugs e padronização visual para o projeto "Eternizar". O escopo do projeto está 100% FECHADO.

---

## PROIBIÇÕES ABSOLUTAS (NÃO FAÇA ISSO):

1. **PROIBIDO** sugerir ou implementar novas funcionalidades (features). O MVP está fechado.
2. **PROIBIDO** reescrever o arquivo inteiro na resposta se a alteração for pequena. Mostre APENAS o trecho afetado com contexto suficiente pra localizar.
3. **PROIBIDO** explicar o que o código faz linha por linha, a menos que eu pergunte. Sem introduções longas, sem conclusões motivacionais, sem "vamos lá!".
4. **PROIBIDO** alterar a estrutura do banco de dados (Supabase) ou o fluxo de rotas atual.
5. **PROIBIDO** trocar bibliotecas ou dependências sem eu pedir (ex: trocar Framer Motion por outra lib, trocar Tailwind por styled-components).
6. **PROIBIDO** usar Lottie, CDNs externas de animação, ou qualquer recurso que dependa de URL externa pra funcionar. Animações são feitas com CSS keyframes ou Framer Motion.
7. **PROIBIDO** re-propor decisões de design já aprovadas (ver lista no `CONTEXTO_PROJETO.md` — seção "Decisões de Design FIRMES").
8. **PROIBIDO** adicionar `console.log` sem que eu peça. Se precisar debugar, me pergunte antes.
9. **PROIBIDO** alterar o player de música para usar Spotify API, YouTube embeds, ou qualquer coisa fora do iTunes preview 30s + link YouTube Music.
10. **PROIBIDO** mudar a marca/nome "Eternizar" ou o logo em Cormorant Garamond.

---

## REGRAS DE RESPOSTA (ECONOMIA DE TOKENS):

1. **Responda APENAS com o bloco de código exato** que foi alterado ou adicionado. Nada mais.
2. **Indique claramente** o arquivo, a linha ou a função onde o código deve ser inserido/alterado.
3. **Se a alteração é repetitiva** (ex: 8 passos do wizard com a mesma classe Tailwind), mostre a alteração para UM exemplo e diga "aplique o mesmo padrão aos outros". Eu faço o trabalho manual.
4. **Ao lidar com UI**, siga ESTRITAMENTE o arquivo `REGRAS_VISUAIS.md`.
5. **Ao mexer em arquivos dentro de `p/[slug]/`**, lembre que PowerShell não lida bem com colchetes em paths. Use `[System.IO.File]::ReadAllText()` em vez de `Get-Content`.
6. **Ao fazer replace via PowerShell**, NUNCA use here-strings (`@"..."@`) com JSX que tenha backticks — eles serão corrompidos. Use `.Replace()` com strings concatenadas ou edite por índice de linha com `ReadAllLines()`.
7. **Antes de qualquer edição**, leia o trecho atual do arquivo pra confirmar o contexto. Não assuma que o código está como da última vez.

---

## FORMATO DE RESPOSTA ESPERADO:

### Para correção de bug:
```
**Arquivo:** `src/app/criar/page.tsx`
**Linha:** ~410 (função `aplicarSugestao`)
**Problema:** [descrição curta]
**Fix:**
```

### Para ajuste visual:
```
**Arquivo:** `src/app/p/[slug]/PaginaCliente.tsx`
**Seção:** Timeline
**Antes:** `className="pb-16"`
**Depois:** `className="pb-20"`
```

### Para múltiplas alterações:
Numere cada alteração e agrupe por arquivo.

---

## PRIORIDADES (nesta ordem):
1. **Bugs que quebram** — erros de build, runtime errors, páginas que não carregam
2. **Bugs visuais** — layout quebrado, cores erradas, responsividade
3. **Padronização** — inconsistências de estilo entre páginas
4. **Performance** — carregamento lento, re-renders desnecessários
5. **Refatoração** — código duplicado, organização

---

## CONTEXTO TÉCNICO RÁPIDO:
- Modo teste ativo (`NEXT_PUBLIC_MODO_TESTE=true`) — páginas são criadas sem pagamento via `/api/teste/criar`
- Cores do tema são nomes (`pink`, `violet`, `amber`...) mapeados pra hex em `paletas` dentro do `PaginaCliente.tsx`
- Na `/sucesso`, a cor vem como query param e precisa ser convertida pra hex via `coresMap`
- O `supabaseAdmin()` retorna um novo client com service role key — é uma FUNÇÃO, não uma constante
- Fotos são salvas no Supabase Storage bucket `fotos` com path `{slug}/nome.ext`
