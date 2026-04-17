const fs = require('fs');

let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// =====================================================================
// 1. CONTADOR ODÔMETRO — count-up from 0 + seconds pulse
// =====================================================================

const oldContador = c.match(/\/\/ Contador de tempo de namoro\nfunction ContadorTempo[\s\S]*?\n\}\n\}/);
if (!oldContador) {
  console.log('WARN: ContadorTempo not found by regex, trying alternate');
}

const newContador = `// Contador de tempo com efeito odometro
function ContadorTempo({ dataInicio, cor, paleta }: { dataInicio: string; cor: string; paleta: typeof paletas[string] }) {
  const [tempo, setTempo] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 })
  const [animado, setAnimado] = useState(false)
  const [display, setDisplay] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function calcular() {
      const inicio = new Date(dataInicio)
      const agora = new Date()
      const diff = agora.getTime() - inicio.getTime()
      if (diff < 0) return
      const seg = Math.floor(diff / 1000)
      const min = Math.floor(seg / 60)
      const hrs = Math.floor(min / 60)
      const diasT = Math.floor(hrs / 24)
      setTempo({
        anos: Math.floor(diasT / 365),
        meses: Math.floor((diasT % 365) / 30),
        dias: diasT % 30,
        horas: hrs % 24,
        minutos: min % 60,
        segundos: seg % 60,
      })
    }
    calcular()
    const interval = setInterval(calcular, 1000)
    return () => clearInterval(interval)
  }, [dataInicio])

  // Odometer count-up animation on first view
  useEffect(() => {
    if (animado) {
      setDisplay(tempo)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animado) {
        setAnimado(true)
        const target = { ...tempo }
        const dur = 1800
        const start = performance.now()
        function tick(now: number) {
          const p = Math.min((now - start) / dur, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setDisplay({
            anos: Math.round(target.anos * ease),
            meses: Math.round(target.meses * ease),
            dias: Math.round(target.dias * ease),
            horas: Math.round(target.horas * ease),
            minutos: Math.round(target.minutos * ease),
            segundos: target.segundos,
          })
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [tempo, animado])

  // After animation, sync seconds live
  useEffect(() => {
    if (animado) setDisplay(prev => ({ ...prev, segundos: tempo.segundos }))
  }, [tempo.segundos, animado])

  const itens = [
    { label: 'Anos', valor: display.anos, destaque: false },
    { label: 'Meses', valor: display.meses, destaque: false },
    { label: 'Dias', valor: display.dias, destaque: false },
    { label: 'Horas', valor: display.horas, destaque: false },
    { label: 'Min', valor: display.minutos, destaque: false },
    { label: 'Seg', valor: display.segundos, destaque: true },
  ]

  return (
    <div ref={ref} className="max-w-sm mx-auto space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {itens.slice(0, 3).map((item) => (
          <div key={item.label} className="text-center py-5 px-2 rounded-2xl"
            style={{ background: \`linear-gradient(135deg, \${cor}18, \${cor}08)\`, border: \`1px solid \${cor}25\` }}>
            <p className="text-4xl font-black leading-none tracking-tight text-white tabular-nums">
              {String(item.valor).padStart(2, '0')}
            </p>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {itens.slice(3).map((item) => (
          <div key={item.label}
            className={\`text-center py-4 px-2 rounded-2xl transition-transform \${item.destaque ? 'scale-[1.02]' : ''}\`}
            style={{
              background: item.destaque ? \`linear-gradient(135deg, \${cor}30, \${cor}15)\` : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
              border: item.destaque ? \`1px solid \${cor}50\` : '1px solid rgba(255,255,255,0.08)',
              transition: 'transform 0.15s ease',
            }}>
            <p className="text-3xl font-black leading-none tracking-tight tabular-nums"
              style={{ color: item.destaque ? cor : 'white' }}>
              {String(item.valor).padStart(2, '0')}
            </p>
            <p className="text-xs text-gray-500 mt-1.5 uppercase tracking-widest">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}`;

// Replace ContadorTempo
const contadorStart = c.indexOf('// Contador de tempo de namoro\nfunction ContadorTempo') !== -1
  ? c.indexOf('// Contador de tempo de namoro\nfunction ContadorTempo')
  : c.indexOf('// Contador de tempo');

if (contadorStart === -1) {
  // Try alternate
  const alt = c.indexOf('function ContadorTempo');
  if (alt !== -1) {
    // Find the end - two closing braces at start of line after the function
    console.log('Found ContadorTempo at', alt);
  }
}

// Use regex to find and replace the entire ContadorTempo function
const contadorRegex = /\/\/[^\n]*[Cc]ontador[^\n]*\nfunction ContadorTempo[^]*?\n  \)\n\}/;
const contadorMatch = c.match(contadorRegex);
if (contadorMatch) {
  c = c.replace(contadorMatch[0], newContador);
  console.log('OK: ContadorTempo replaced with odometer effect');
} else {
  console.log('WARN: Could not find ContadorTempo to replace');
}

// =====================================================================
// 2. PLAYER IMERSIVO — album color blur background
// =====================================================================

// Wrap PlayerMusica's outer div with a background blur section
const oldPlayerStart = `<div className="rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto border border-white/8" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>`;
const newPlayerStart = `<div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto border border-white/8">
      {/* Album color blur background */}
      {dados.capa && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dados.capa} alt="" className="w-full h-full object-cover blur-[40px] scale-150 opacity-30" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      <div className="relative z-10" style={{ background: 'rgba(0,0,0,0.3)' }}>`;

if (c.includes(oldPlayerStart)) {
  c = c.replace(oldPlayerStart, newPlayerStart);
  
  // Close the extra wrapper div before the component's closing
  // Find the closing </div> of the player and add one more
  const playerEndPattern = `<p className="text-center text-xs text-gray-600 mt-2">Preview de 30s`;
  const playerEndIdx = c.indexOf(playerEndPattern);
  if (playerEndIdx !== -1) {
    // Find the next </div>\n    </div> after that
    const afterEnd = c.indexOf('</div>\n    </div>\n  )', playerEndIdx);
    if (afterEnd !== -1) {
      c = c.slice(0, afterEnd + 6) + '\n      </div>' + c.slice(afterEnd + 6);
    }
  }
  console.log('OK: PlayerMusica enhanced with album blur background');
} else {
  console.log('WARN: PlayerMusica start not found');
}

// =====================================================================
// 3. CARTA SELADA — envelope with typing effect for message
// =====================================================================

// Add CartaSelada component before the export
const cartaComponent = `
// Carta Selada com efeito de digitacao
function CartaSelada({ mensagem, cor, fontCorpo }: { mensagem: string; cor: string; fontCorpo: string }) {
  const [aberta, setAberta] = useState(false)
  const [textoVisivel, setTextoVisivel] = useState('')
  const [digitando, setDigitando] = useState(false)

  useEffect(() => {
    if (!aberta || digitando) return
    setDigitando(true)
    let i = 0
    const interval = setInterval(() => {
      i++
      setTextoVisivel(mensagem.slice(0, i))
      if (i >= mensagem.length) {
        clearInterval(interval)
        setDigitando(false)
      }
    }, 35)
    return () => clearInterval(interval)
  }, [aberta, mensagem, digitando])

  if (!aberta) {
    return (
      <motion.button
        onClick={() => setAberta(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 py-10 px-6 rounded-3xl border-2 border-dashed cursor-pointer transition-colors"
        style={{ borderColor: \`\${cor}40\`, background: \`\${cor}08\` }}
      >
        <div className="w-16 h-12 relative">
          <div className="absolute inset-0 rounded-lg" style={{ background: \`\${cor}20\`, border: \`2px solid \${cor}40\` }} />
          <div className="absolute top-0 left-0 right-0 h-6" style={{
            background: \`\${cor}15\`,
            clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
            borderBottom: \`2px solid \${cor}30\`
          }} />
        </div>
        <p className="text-sm font-medium" style={{ color: cor }}>Toque para abrir a carta</p>
        <p className="text-xs text-gray-600">Uma mensagem especial espera por voce</p>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-lg mx-auto rounded-3xl p-8 border"
      style={{ background: \`\${cor}08\`, borderColor: \`\${cor}20\` }}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-0.5 rounded-full" style={{ background: cor }} />
        <p className="text-xs uppercase tracking-widest" style={{ color: \`\${cor}99\` }}>Carta do coracao</p>
        <div className="flex-1 h-0.5 rounded-full" style={{ background: \`\${cor}15\` }} />
      </div>
      <p className="text-lg leading-relaxed whitespace-pre-wrap" style={{ fontFamily: fontCorpo, color: 'rgba(255,255,255,0.85)' }}>
        {textoVisivel}
        {digitando && <span className="inline-block w-0.5 h-5 ml-0.5 animate-pulse" style={{ background: cor }} />}
      </p>
    </motion.div>
  )
}
`;

// Insert before export default
const exportIdx = c.indexOf('export default function PaginaCliente');
if (exportIdx !== -1) {
  c = c.slice(0, exportIdx) + cartaComponent + '\n' + c.slice(exportIdx);
  console.log('OK: CartaSelada component added');
} else {
  console.log('WARN: export not found');
}

// Now replace where mensagem is displayed with CartaSelada (for casal type)
// Find the mensagem section in the main render
const mensagemPattern = /<p[^>]*className="[^"]*leading-relaxed[^"]*whitespace-pre-wrap[^"]*"[^>]*>\s*\{pagina\.mensagem\}\s*<\/p>/;
const mensagemMatch = c.match(mensagemPattern);
if (mensagemMatch) {
  c = c.replace(
    mensagemMatch[0],
    `{pagina.tipo === 'casal' ? (
              <CartaSelada mensagem={pagina.mensagem} cor={cor} fontCorpo={fontCorpo} />
            ) : (
              ${mensagemMatch[0]}
            )}`
  );
  console.log('OK: Mensagem replaced with CartaSelada for casais');
} else {
  console.log('WARN: mensagem display not found, searching alternate...');
  // Try finding {pagina.mensagem} directly
  const alt = c.indexOf('{pagina.mensagem}');
  if (alt !== -1) {
    console.log('  Found {pagina.mensagem} at position', alt);
    // Get surrounding context
    const ctx = c.slice(Math.max(0, alt - 100), alt + 100);
    console.log('  Context:', ctx.replace(/\n/g, '\\n').slice(0, 200));
  }
}

// =====================================================================
// 4. CSS GLINT EFFECT for graduation seal
// =====================================================================
// Add to globals.css instead - we'll do this via a separate step

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');

// Verify
const final = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
console.log('\n--- Verification ---');
console.log('Has odometer:', final.includes('odometer') || final.includes('Odometro') || final.includes('odometro'));
console.log('Has CartaSelada:', final.includes('function CartaSelada'));
console.log('Has album blur:', final.includes('blur-[40px] scale-150 opacity-30'));
console.log('Has count-up anim:', final.includes('requestAnimationFrame(tick)'));
console.log('File size:', Math.round(final.length / 1024) + 'KB');
