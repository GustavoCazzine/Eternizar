const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ========== 1. PLAYER IMERSIVO — album blur background ==========
// Find the PlayerMusica return's outer div
const playerReturn = c.indexOf("return (\n    <div className=\"rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto");
if (playerReturn !== -1) {
  // Find the exact line
  const lineEnd = c.indexOf('\n', playerReturn + 15);
  const oldLine = c.slice(playerReturn + 'return (\n    '.length, lineEnd);
  console.log('Player div:', oldLine.slice(0, 100));
  
  // Replace with blur wrapper
  const newStart = `return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto border border-white/8">
      {dados.capa && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dados.capa} alt="" className="w-full h-full object-cover blur-[30px] scale-150 opacity-25" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      <div className="relative z-10">`;
  
  c = c.slice(0, playerReturn + 'return (\n    '.length) + newStart.slice(15) + c.slice(lineEnd);
  
  // Add closing </div> before the component's last </div>
  // Find the end of PlayerMusica's return - look for the YouTube Music link paragraph
  const ytText = "Preview de 30s";
  const ytIdx = c.indexOf(ytText, playerReturn);
  if (ytIdx !== -1) {
    // Find </div>\n    </div> after that
    let searchFrom = ytIdx;
    // Go to end of that </p> then find next </div>
    const pClose = c.indexOf('</p>', searchFrom);
    const nextDiv = c.indexOf('\n    </div>', pClose);
    if (nextDiv !== -1) {
      // Insert extra closing </div> before that
      c = c.slice(0, nextDiv) + '\n      </div>' + c.slice(nextDiv);
      console.log('OK: Player blur background added');
    }
  }
} else {
  console.log('SKIP: Player div not found (may have different format)');
  // Try alternate
  const alt = c.indexOf('rounded-3xl overflow-hidden shadow-2xl max-w-sm');
  console.log('  Alt search at:', alt);
}

// ========== 2. GLINT EFFECT CSS ==========
let css = fs.readFileSync('src/app/globals.css', 'utf8');
if (!css.includes('glint')) {
  css += `
/* Glint metallic effect */
@keyframes glint {
  0%, 100% { transform: translateX(-100%) rotate(45deg); }
  50% { transform: translateX(200%) rotate(45deg); }
}
.glint-effect {
  position: relative;
  overflow: hidden;
}
.glint-effect::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 30%;
  height: 200%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transform: translateX(-100%) rotate(45deg);
  animation: glint 5s ease-in-out infinite;
}
`;
  fs.writeFileSync('src/app/globals.css', css, 'utf8');
  console.log('OK: Glint CSS added');
}

// ========== 3. BOTÃO REAÇÃO AFETIVA ==========
// Add a LikeButton component before CartaSelada
if (!c.includes('function BotaoReacao')) {
  const cartaIdx = c.indexOf('// Carta selada');
  if (cartaIdx !== -1) {
    const botao = `// Botao de reacao afetiva com confetti
function BotaoReacao({ cor }: { cor: string }) {
  const [curtidas, setCurtidas] = useState(0)
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; r: number}>>([])

  function handleCurtir() {
    setCurtidas(prev => prev + 1)
    const novas = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 120,
      y: -(Math.random() * 80 + 30),
      r: Math.random() * 360,
    }))
    setParticles(novas)
    setTimeout(() => setParticles([]), 1500)
  }

  return (
    <div className="flex flex-col items-center gap-2 relative">
      <motion.button onClick={handleCurtir} whileTap={{ scale: 0.85 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: \`linear-gradient(135deg, \${cor}, \${cor}aa)\` }}>
        <Heart className="w-6 h-6 text-white fill-white" />
        {particles.map(p => (
          <motion.div key={p.id} className="absolute w-2 h-2 rounded-full"
            style={{ background: cor }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0, rotate: p.r }}
            transition={{ duration: 1, ease: 'easeOut' }} />
        ))}
      </motion.button>
      {curtidas > 0 && (
        <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="text-xs text-gray-500">{curtidas} {curtidas === 1 ? 'curtida' : 'curtidas'}</motion.span>
      )}
    </div>
  )
}

`;
    c = c.slice(0, cartaIdx) + botao + c.slice(cartaIdx);
    console.log('OK: BotaoReacao added');
  }
}

// Integrate BotaoReacao at end of page (before footer/guestbook)
// Find a good insertion point - after mensagem section
if (c.includes('function BotaoReacao') && !c.includes('<BotaoReacao')) {
  // Find the mensagem/carta section and add after it
  const cartaUse = c.indexOf("pagina.tipo === 'casal' && <CartaSelada");
  if (cartaUse !== -1) {
    const afterCarta = c.indexOf('\n', c.indexOf('/>', cartaUse));
    c = c.slice(0, afterCarta) + '\n            <div className="flex justify-center mt-8"><BotaoReacao cor={cor} /></div>' + c.slice(afterCarta);
    console.log('OK: BotaoReacao integrated');
  }
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');

// Verify
const funcs = ['ContadorTempo','ParallaxLayer','PlayerMusica','CartaSelada','BotaoReacao','PaginaCliente'];
console.log('\n--- Verify ---');
funcs.forEach(f => console.log(`${c.includes('function '+f)?'OK':'MISS'}: ${f}`));
