const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Helper: find function boundaries by brace counting
function findFuncBounds(code, funcName) {
  const marker = `function ${funcName}`;
  const start = code.indexOf(marker);
  if (start === -1) return null;
  
  // Find the opening brace of the function body
  let braceStart = code.indexOf('{', start);
  if (braceStart === -1) return null;
  
  let depth = 1;
  let i = braceStart + 1;
  while (i < code.length && depth > 0) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') depth--;
    i++;
  }
  
  // Also include any comment line right before the function
  let commentStart = start;
  const prevNewline = code.lastIndexOf('\n', start - 1);
  if (prevNewline !== -1) {
    const prevLine = code.slice(code.lastIndexOf('\n', prevNewline - 1) + 1, prevNewline).trim();
    if (prevLine.startsWith('//')) {
      commentStart = code.lastIndexOf('\n', prevNewline - 1) + 1;
    }
  }
  
  return { start: commentStart, end: i };
}

// ========== 1. REPLACE ContadorTempo ==========
const bounds = findFuncBounds(c, 'ContadorTempo');
if (bounds) {
  const oldFunc = c.slice(bounds.start, bounds.end);
  console.log('ContadorTempo found:', bounds.start, '-', bounds.end, '(' + oldFunc.length + ' chars)');
  
  const newContador = `// Contador com efeito odometro
function ContadorTempo({ dataInicio, cor, paleta }: { dataInicio: string; cor: string; paleta: typeof paletas[string] }) {
  const [tempo, setTempo] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 })
  const [animado, setAnimado] = useState(false)
  const [display, setDisplay] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 })
  const contadorRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (animado) { setDisplay(tempo); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animado) {
        setAnimado(true)
        const target = { ...tempo }
        const start = performance.now()
        function tick(now: number) {
          const p = Math.min((now - start) / 1800, 1)
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
    if (contadorRef.current) observer.observe(contadorRef.current)
    return () => observer.disconnect()
  }, [tempo, animado])

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
    <div ref={contadorRef} className="max-w-sm mx-auto space-y-3">
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
            className="text-center py-4 px-2 rounded-2xl"
            style={{
              background: item.destaque ? \`linear-gradient(135deg, \${cor}30, \${cor}15)\` : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
              border: item.destaque ? \`1px solid \${cor}50\` : '1px solid rgba(255,255,255,0.08)',
              transform: item.destaque ? 'scale(1.02)' : 'none',
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

  c = c.slice(0, bounds.start) + newContador + c.slice(bounds.end);
  console.log('OK: ContadorTempo replaced');
} else {
  console.log('FAIL: ContadorTempo not found');
}

// ========== 2. ADD CartaSelada before export ==========
if (!c.includes('function CartaSelada')) {
  const carta = `
// Carta selada com efeito de digitacao
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
      if (i >= mensagem.length) { clearInterval(interval); setDigitando(false) }
    }, 35)
    return () => clearInterval(interval)
  }, [aberta, mensagem, digitando])

  if (!aberta) {
    return (
      <motion.button onClick={() => setAberta(true)} whileTap={{ scale: 0.97 }}
        className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 py-10 px-6 rounded-3xl border-2 border-dashed cursor-pointer"
        style={{ borderColor: \`\${cor}40\`, background: \`\${cor}08\` }}>
        <div className="w-16 h-12 relative">
          <div className="absolute inset-0 rounded-lg" style={{ background: \`\${cor}20\`, border: \`2px solid \${cor}40\` }} />
          <div className="absolute top-0 left-0 right-0 h-6" style={{ background: \`\${cor}15\`, clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: cor }}>Toque para abrir a carta</p>
        <p className="text-xs text-gray-600">Uma mensagem especial espera por voce</p>
      </motion.button>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-lg mx-auto rounded-3xl p-8 border" style={{ background: \`\${cor}08\`, borderColor: \`\${cor}20\` }}>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-0.5 rounded-full" style={{ background: cor }} />
        <p className="text-xs uppercase tracking-widest" style={{ color: \`\${cor}99\` }}>Mensagem do coracao</p>
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
  const exportIdx = c.indexOf('export default function PaginaCliente');
  c = c.slice(0, exportIdx) + carta + c.slice(exportIdx);
  console.log('OK: CartaSelada added');
}

// ========== 3. Use CartaSelada for mensagem (casal type) ==========
// Find {pagina.mensagem} and wrap with conditional
const msgIdx = c.indexOf('{pagina.mensagem}');
if (msgIdx !== -1 && !c.includes('CartaSelada mensagem=')) {
  // Get the surrounding tag
  const lineStart = c.lastIndexOf('\n', msgIdx);
  const lineEnd = c.indexOf('\n', msgIdx);
  const line = c.slice(lineStart, lineEnd);
  console.log('Mensagem line:', line.trim().slice(0, 120));
  
  // Replace just {pagina.mensagem} with conditional
  c = c.replace(
    '{pagina.mensagem}',
    `{pagina.tipo === 'casal' ? '' : pagina.mensagem}`
  );
  
  // Insert CartaSelada usage right after the mensagem container
  // Find the closing tag of the mensagem section
  const afterMsg = c.indexOf('</p>', msgIdx);
  if (afterMsg !== -1) {
    const insertAt = c.indexOf('\n', afterMsg);
    c = c.slice(0, insertAt) + `\n            {pagina.tipo === 'casal' && <CartaSelada mensagem={pagina.mensagem} cor={cor} fontCorpo={fontCorpo} />}` + c.slice(insertAt);
    console.log('OK: CartaSelada integrated for casal');
  }
}

// ========== 4. Fix music autoplay (from earlier) ==========
if (c.includes("audio.play().then(() => setTocando(true)).catch(() => {})")) {
  c = c.replace(
    "audio.play().then(() => setTocando(true)).catch(() => {})",
    "// Audio ready, user must tap play\n      setTocando(false)"
  );
  console.log('OK: Autoplay removed');
}

// Fix togglePlay catch
c = c.replace(
  "else { audio.play(); setTocando(true) }",
  "else { audio.play().then(() => setTocando(true)).catch(() => {}) }"
);

// ========== VERIFY ==========
const funcs = ['ContadorTempo', 'ParallaxLayer', 'PlayerMusica', 'SlideMemoria', 'CartaSelada', 'PaginaCliente', 'Secao'];
console.log('\n--- Functions ---');
funcs.forEach(f => {
  const has = c.includes(`function ${f}`);
  console.log(`${has ? 'OK' : 'MISSING'}: ${f}`);
});
console.log('Size:', Math.round(c.length / 1024) + 'KB');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
