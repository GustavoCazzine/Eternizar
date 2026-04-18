const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== 1. MINI PLAYER — replace big card with inline mini =====
// Find PlayerMusica function and replace entirely
const playerStart = c.indexOf('// Player de m');
const playerFuncStart = c.indexOf('function PlayerMusica');
const playerFuncEnd = findFuncEnd(c, 'PlayerMusica');

function findFuncEnd(code, name) {
  const start = code.indexOf('function ' + name);
  if (start === -1) return null;
  let i = code.indexOf('(', start);
  let d = 1; i++;
  while (i < code.length && d > 0) { if (code[i]==='(') d++; else if (code[i]===')') d--; i++; }
  i = code.indexOf('{', i);
  d = 1; i++;
  while (i < code.length && d > 0) { if (code[i]==='{') d++; else if (code[i]==='}') d--; i++; }
  return i;
}

if (playerFuncStart !== -1 && playerFuncEnd) {
  const miniPlayer = `// Mini player inline
function PlayerMusica({ dados, cor }: { dados: MusicaDados; cor: string }) {
  const [tocando, setTocando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!dados.previewUrl) return
    const audio = new Audio(dados.previewUrl)
    audio.setAttribute('playsinline', 'true')
    audio.volume = 0.5
    audioRef.current = audio
    audio.loop = true
    audio.ontimeupdate = () => setProgresso((audio.currentTime / audio.duration) * 100 || 0)
    return () => { audio.pause(); audio.src = '' }
  }, [dados.previewUrl])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (tocando) { audio.pause(); setTocando(false) }
    else { audio.play().then(() => setTocando(true)).catch(() => {}) }
  }

  return (
    <div className="flex items-center gap-4 max-w-md mx-auto p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Album cover — spinning */}
      <motion.button onClick={togglePlay} className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-lg"
        animate={{ rotate: tocando ? 360 : 0 }}
        transition={tocando ? { duration: 8, repeat: Infinity, ease: 'linear' } : { duration: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dados.capa} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          {tocando ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
        </div>
      </motion.button>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{dados.nome}</p>
        <p className="text-xs text-gray-500 truncate">{dados.artista}</p>
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: \`\${progresso}%\`, backgroundColor: cor }} />
        </div>
      </div>
    </div>
  )
}`;

  const commentStart = playerStart !== -1 ? playerStart : playerFuncStart;
  c = c.slice(0, commentStart) + miniPlayer + c.slice(playerFuncEnd);
  console.log('1. Mini player: OK');
}

// ===== 2. MOVE PLAYER BELOW COUNTER IN HERO =====
// Remove the dedicated player section and put player inline in hero/counter
const playerSection = c.indexOf('{/* ===== SLIDE 4');
if (playerSection !== -1) {
  const sectionEnd = c.indexOf('</section>', playerSection);
  const fullEnd = c.indexOf('\n', sectionEnd + 10);
  const oldSection = c.slice(playerSection, fullEnd);
  c = c.replace(oldSection, '{/* Player moved to counter section */}');
  console.log('2a. Player section: removed');
}

// Insert player usage inside the counter section, after the counter component
const counterSecao = c.indexOf("</Secao>\n\n        {/* Cards de dados do casal */}");
if (counterSecao !== -1) {
  c = c.replace(
    "</Secao>\n\n        {/* Cards de dados do casal */}",
    "</Secao>\n\n        {/* Mini Player */}\n        {pagina.musica_dados && <Secao delay={0.3}><PlayerMusica dados={pagina.musica_dados} cor={cor} /></Secao>}\n\n        {/* Cards de dados do casal */}"
  );
  console.log('2b. Player in counter section: OK');
} else {
  // Alt: put after counter usage
  const afterCounter = c.indexOf('<ContadorTempo');
  if (afterCounter !== -1) {
    const closingSec = c.indexOf('</Secao>', afterCounter);
    const insertAt = c.indexOf('\n', closingSec);
    c = c.slice(0, insertAt) + '\n        {pagina.musica_dados && <Secao delay={0.3}><PlayerMusica dados={pagina.musica_dados} cor={cor} /></Secao>}' + c.slice(insertAt);
    console.log('2b. Player after counter: OK');
  }
}

// Also keep player for non-casal types — add before mensagem section  
const mensagemSection = c.indexOf('{/* ===== SLIDE 5');
if (mensagemSection !== -1) {
  // Add player for all types before mensagem if not already in counter
  c = c.replace(
    '{/* ===== SLIDE 5',
    '{/* Player for non-casal */}\n        {pagina.tipo !== \'casal\' && pagina.musica_dados && (\n          <section className="py-12 px-4" style={{ background: \'#000\' }}>\n            <Secao><PlayerMusica dados={pagina.musica_dados} cor={cor} /></Secao>\n          </section>\n        )}\n\n        {/* ===== SLIDE 5'
  );
  console.log('2c. Player for non-casal: OK');
}

// ===== 3. GLASSMORPHISM on cards =====
// Update card backgrounds to use glassmorphism
c = c.replace(
  /background: 'rgba\(255,255,255,0\.03\)'/g,
  "background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)'"
);
console.log('3. Glassmorphism: OK');

// ===== 4. TYPOGRAPHY — enforce serif for titles =====
// The fontes object already maps titulo fonts per paresFonte
// Make sure section titles use fontes.titulo
// Find section headings like <h2 className="text-3xl...font-black">
const h2Pattern = /<h2 className="text-3xl sm:text-4xl font-black">/g;
c = c.replace(h2Pattern, '<h2 className="text-3xl sm:text-4xl font-black" style={{ fontFamily: fontes.titulo }}>');
console.log('4. Serif section titles: OK');

// ===== 5. BACKGROUND — use #121212 instead of #08080c =====
c = c.split('#08080c').join('#121212');
console.log('5. Background #121212: OK');

// ===== 6. GUESTBOOK INPUT CONTRAST =====
const gbInput = c.indexOf('Seu nome');
if (gbInput !== -1) {
  // Already fixed input contrast globally in previous step
  console.log('6. Guestbook inputs: already enhanced');
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');

// ===== 7. SUPABASE MIGRATION SQL =====
const sql = `-- Migração: novos campos para Eternizar v2
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
`;

fs.writeFileSync('supabase/migracao-v2.sql', sql, 'utf8');
console.log('7. Migration SQL: created');

// ===== VERIFY =====
console.log('\\n--- Verify ---');
const final = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
console.log('Has mini player:', final.includes('w-14 h-14 rounded-full overflow-hidden'));
console.log('Has #121212:', final.includes('#121212'));
console.log('Has glassmorphism:', final.includes("backdropFilter: 'blur(12px)'"));
console.log('Has serif titles:', final.includes('fontFamily: fontes.titulo'));
console.log('Size:', Math.round(final.length/1024) + 'KB');
