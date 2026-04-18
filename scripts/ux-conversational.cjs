const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// ===== 1. TYPEWRITER EFFECT ON TITLES =====
// Add a Typewriter component at the top of the file, after imports
if (!c.includes('function Typewriter')) {
  const afterImports = c.indexOf("// ---");
  const insertAt = afterImports !== -1 ? afterImports : c.indexOf('\ninterface Evento');
  
  const typewriter = `
// Efeito typewriter para titulos
function Typewriter({ text, className = '', style = {} }: { text: string; className?: string; style?: React.CSSProperties }) {
  const [display, setDisplay] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplay(''); setDone(false)
    let i = 0
    const iv = setInterval(() => { i++; setDisplay(text.slice(0,i)); if (i >= text.length) { clearInterval(iv); setDone(true) } }, 30)
    return () => clearInterval(iv)
  }, [text])
  return <h2 className={className} style={style}>{display}{!done && <span className="inline-block w-0.5 h-6 ml-0.5 animate-pulse bg-current opacity-50" />}</h2>
}

`;
  c = c.slice(0, insertAt) + typewriter + c.slice(insertAt);
  console.log('1. Typewriter component: OK');
}

// ===== 2. PULSE ON DATE REWARD =====
c = c.replace(
  "Uau! {d.toLocaleString('pt-BR')} dias juntos",
  "Uau! {d.toLocaleString('pt-BR')} dias juntos"
);
// Add animate-pulse class to the reward text
if (c.includes('dias juntos') && !c.includes('animate-bounce')) {
  c = c.replace(
    'className="text-sm mt-2 font-medium"',
    'className="text-sm mt-2 font-medium animate-bounce"'
  );
  // animate-bounce is too much, use a subtle one
  c = c.replace('animate-bounce', 'animate-pulse');
  console.log('2. Date reward pulse: OK');
}

// ===== 3. SKIP BUTTON — more visible =====
c = c.replace(
  'className="px-4 sm:px-5 py-3 text-sm text-zinc-500 hover:text-zinc-300 transition min-h-[44px]"',
  'className="px-4 sm:px-5 py-3 text-sm text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition min-h-[44px]"'
);
console.log('3. Skip button: more visible');

// ===== 4. MAGIC WAND ON "COMO SE CONHECERAM" =====
const comoIdx = c.indexOf('comoSeConheceram');
if (comoIdx !== -1) {
  // Find the textarea for comoSeConheceram
  const textareaIdx = c.indexOf('<textarea', c.indexOf("'comoSeConheceram'"));
  // Actually find the specific textarea by looking for the placeholder
  const comoTextarea = c.indexOf('placeholder="Ex: Nos conhecemos na faculdade');
  if (comoTextarea !== -1) {
    // Find the textarea opening tag before this placeholder
    const tagStart = c.lastIndexOf('<textarea', comoTextarea);
    
    const wand = `
          {/* Inspiracao */}
          <div className="flex gap-2 mb-2 flex-wrap">
            <span className="text-xs text-zinc-600">Inspira\u00e7\u00e3o:</span>
            {[
              { label: 'Rom\u00e2ntico', text: 'Nos conhecemos em um dia que parecia comum, mas que mudou tudo. Foi um olhar, um sorriso, e de repente o mundo fez sentido.' },
              { label: 'Divertido', text: 'Tudo come\u00e7ou com uma mensagem no Instagram que eu jurava que ia ser ignorada. Plot twist: n\u00e3o foi. E c\u00e1 estamos!' },
              { label: 'Direto', text: 'Nos conhecemos atrav\u00e9s de amigos em comum. Come\u00e7amos a conversar e nunca mais paramos.' },
            ].map(opt => (
              <button key={opt.label} type="button"
                onClick={() => updCasal('comoSeConheceram', opt.text)}
                className="px-2 py-1 rounded-lg text-xs border border-white/10 hover:border-white/25 text-zinc-400 hover:text-white transition">
                \u2728 {opt.label}
              </button>
            ))}
          </div>
`;
    c = c.slice(0, tagStart) + wand + c.slice(tagStart);
    console.log('4. Magic wand "como se conheceram": OK');
  }
}

// ===== 5. TIMELINE EMOJIS -> LUCIDE ICONS =====
// Replace emoji suggestions in timeline with icon names
const oldEmojis = "const emojisRapidos = ['❤️', '🌹', '✈️', '🎉', '💍', '🏠', '🐾', '🎓', '⭐', '🌙', '🌊', '🎵']";
if (c.includes(oldEmojis)) {
  c = c.replace(oldEmojis, "const emojisRapidos = ['\u2665', '\u2605', '\u2708', '\u266B', '\u2726', '\u2302', '\u2022', '\u25CF', '\u2736', '\u2740', '\u2600', '\u263A']");
  console.log('5. Timeline emojis: cleaned');
}

// ===== 6. TIMELINE PHOTO AREA — better visual =====
// Find "Adicionar foto" text and make it more prominent
const addFotoText = c.indexOf('Adicionar foto');
if (addFotoText !== -1) {
  // Check context
  const lineStart = c.lastIndexOf('\n', addFotoText);
  const lineEnd = c.indexOf('\n', addFotoText);
  console.log('6. Add foto line:', c.slice(lineStart, lineEnd).trim().slice(0, 120));
}

// ===== 7. CITY AUTOCOMPLETE — Brazilian cities datalist =====
const cidadeInput = c.indexOf("cidadePrimeiroEncontro', e.target.value)");
if (cidadeInput !== -1) {
  const inputTag = c.lastIndexOf('<input', cidadeInput);
  const inputEnd = c.indexOf('/>', cidadeInput) + 2;
  const oldInput = c.slice(inputTag, inputEnd);
  
  if (!oldInput.includes('list="cidades"')) {
    const newInput = oldInput.replace('/>', ' list="cidades" autoComplete="off" />');
    const datalist = `
          <datalist id="cidades">
            {['S\u00e3o Paulo, SP','Rio de Janeiro, RJ','Belo Horizonte, MG','Bras\u00edlia, DF','Curitiba, PR','Salvador, BA','Fortaleza, CE','Recife, PE','Porto Alegre, RS','Goi\u00e2nia, GO','Manaus, AM','Campinas, SP','S\u00e3o Lu\u00eds, MA','Florian\u00f3polis, SC','Vit\u00f3ria, ES','Natal, RN','Santos, SP','Ribeir\u00e3o Preto, SP','Sorocaba, SP','Joinville, SC','Londrina, PR','Niter\u00f3i, RJ','Aracaju, SE','Maceió, AL','Campo Grande, MS'].map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>`;
    c = c.replace(oldInput, newInput + datalist);
    console.log('7. City autocomplete datalist: OK');
  }
}

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
console.log('\nAll conversational UX applied.');
