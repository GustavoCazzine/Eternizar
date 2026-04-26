const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== 1. REPLACE IMPORT =====
c = c.replace("import IntroWrapped from '@/components/IntroWrapped'", "import EternizarWrapped from '@/components/EternizarWrapped'");
// Also remove CuriosidadesMagicas import if it's separate (keep if used elsewhere)
console.log('1. Import replaced');

// ===== 2. REPLACE STATE =====
c = c.replace(
  "const [introVisivel, setIntroVisivel] = useState(true)",
  "const [showWrapped, setShowWrapped] = useState(true)"
);
console.log('2. State renamed');

// ===== 3. FIX SCROLL LOCK — replace introVisivel with showWrapped =====
c = c.replace(/introVisivel \? 'hidden' : 'unset'/g, "showWrapped ? 'hidden' : 'unset'");
c = c.replace(/\[introVisivel\]/g, "[showWrapped]");
console.log('3. Scroll lock refs updated');

// ===== 4. REMOVE OLD IntroWrapped RENDER + Fragment =====
// Remove the IntroWrapped JSX block
const introJSX = /\s*<>\s*\{\/\* Cortina de abertura \*\/\}\s*\{introVisivel && pagina\.tipo === 'casal' && \(\s*<IntroWrapped[\s\S]*?\/>\s*\)\}/;
c = c.replace(introJSX, '');
console.log('4a. Old IntroWrapped JSX removed');

// Try alternate patterns for the IntroWrapped render
const altIntro = /\s*<>\s*\{introVisivel && pagina\.tipo === 'casal' && \(\s*<IntroWrapped[\s\S]*?\/>\s*\)\}/;
c = c.replace(altIntro, '');

// Also try with showWrapped (in case state was already renamed)
const altIntro2 = /\s*<>\s*\{showWrapped && pagina\.tipo === 'casal' && \(\s*<EternizarWrapped[\s\S]*?\/>\s*\)\}/;
c = c.replace(altIntro2, '');

// Remove the fragment opening if still there without IntroWrapped
c = c.replace(/return \(\s*\n\s*<>\s*\n\s*<div ref={containerRef}/, 'return (\n      <div ref={containerRef}');

// Remove closing fragment
c = c.replace(/\s*<\/>\s*\n\s*\)/, '\n )');

console.log('4b. Fragment cleanup');

// ===== 5. ADD WRAPPED INSIDE RETURN — right after return ( =====
const returnIdx = c.indexOf("return (\n", c.indexOf('export default function PaginaCliente'));
if (returnIdx !== -1) {
  const afterReturn = c.indexOf('\n', returnIdx);
  // Check it's not already there
  if (!c.includes('EternizarWrapped')) {
    // Don't use fragment — wrap in a div or use fragment properly
  }
}

// Actually, the simplest approach: add EternizarWrapped INSIDE the main div, as the first child
const mainDiv = c.indexOf('<div ref={containerRef} className="text-white');
if (mainDiv !== -1 && !c.includes('EternizarWrapped')) {
  const afterMainDiv = c.indexOf('\n', mainDiv);
  const wrappedJSX = `
        {/* Spotify Wrapped Intro */}
        {showWrapped && pagina.tipo === 'casal' && (
          <EternizarWrapped
            titulo={pagina.titulo}
            fotoCapa={fotoCapa}
            dataInicio={pagina.dados_casal?.dataInicio}
            comidaFavorita={pagina.dados_casal?.comeFavorita}
            cor={cor}
            fontes={fontes}
            onDesbloquear={() => setShowWrapped(false)}
          />
        )}
`;
  c = c.slice(0, afterMainDiv) + wrappedJSX + c.slice(afterMainDiv);
  console.log('5. EternizarWrapped added inside main div');
}

// ===== 6. CLEANUP — remove any remaining introVisivel references =====
c = c.replace(/introVisivel/g, 'showWrapped');
console.log('6. All introVisivel -> showWrapped');

// ===== 7. VERIFY =====
fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');

const final = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
const lines = final.split('\n');

console.log('\n--- VERIFY ---');
console.log('Has IntroWrapped:', final.includes('IntroWrapped'));
console.log('Has EternizarWrapped import:', final.includes("import EternizarWrapped"));
console.log('Has EternizarWrapped render:', final.includes('<EternizarWrapped'));
console.log('Has showWrapped state:', final.includes("const [showWrapped, setShowWrapped] = useState(true)"));
console.log('Has introVisivel:', final.includes('introVisivel'));
console.log('Has <> fragment:', final.includes('<>\n'));

// Show where EternizarWrapped is rendered
lines.forEach((l, i) => {
  if (l.includes('EternizarWrapped') && !l.includes('import'))
    console.log('RENDER L' + (i+1) + ': ' + l.trim().slice(0, 90));
});

// Show export line
lines.forEach((l, i) => {
  if (l.includes('export default function PaginaCliente'))
    console.log('EXPORT L' + (i+1));
});
