const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');
console.log('Restored. Lines:', c.split('\n').length, 'Size:', Math.round(c.length/1024)+'KB');
console.log('Starts with use client:', c.startsWith("'use client'"));

// ===== ALL UX CHANGES IN ONE SAFE PASS =====

// Helper: find function end by counting parens then braces
function findFuncEnd(code, name) {
  const start = code.indexOf('function ' + name);
  if (start === -1) return null;
  // Skip past params
  let i = code.indexOf('(', start);
  let depth = 1;
  i++;
  while (i < code.length && depth > 0) {
    if (code[i] === '(') depth++;
    else if (code[i] === ')') depth--;
    i++;
  }
  // Now find body braces
  i = code.indexOf('{', i);
  depth = 1;
  i++;
  while (i < code.length && depth > 0) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') depth--;
    i++;
  }
  return i;
}

// 1. CONTADOR ODOMETRO
const contStart = c.indexOf('// Contador de tempo');
const contFuncStart = c.indexOf('function ContadorTempo');
const contEnd = findFuncEnd(c, 'ContadorTempo');
if (contStart !== -1 && contEnd) {
  const replacement = `// Contador com efeito odometro
function ContadorTempo({ dataInicio, cor, paleta }: { dataInicio: string; cor: string; paleta: typeof paletas[string] }) {
  const [tempo, setTempo] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 })
  const [animado, setAnimado] = useState(false)
  const [display, setDisplay] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 })
  const contadorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function calc() {
      const d = Date.now() - new Date(dataInicio).getTime()
      if (d < 0) return
      const s = Math.floor(d/1000), m = Math.floor(s/60), h = Math.floor(m/60), dd = Math.floor(h/24)
      setTempo({ anos: Math.floor(dd/365), meses: Math.floor((dd%365)/30), dias: dd%30, horas: h%24, minutos: m%60, segundos: s%60 })
    }
    calc(); const iv = setInterval(calc, 1000); return () => clearInterval(iv)
  }, [dataInicio])
  useEffect(() => {
    if (animado) { setDisplay(tempo); return }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animado) {
        setAnimado(true)
        const tgt = { ...tempo }, t0 = performance.now()
        function tick(now: number) {
          const p = Math.min((now-t0)/1800, 1), ease = 1-Math.pow(1-p,3)
          setDisplay({ anos: Math.round(tgt.anos*ease), meses: Math.round(tgt.meses*ease), dias: Math.round(tgt.dias*ease), horas: Math.round(tgt.horas*ease), minutos: Math.round(tgt.minutos*ease), segundos: tgt.segundos })
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (contadorRef.current) obs.observe(contadorRef.current)
    return () => obs.disconnect()
  }, [tempo, animado])
  useEffect(() => { if (animado) setDisplay(p => ({ ...p, segundos: tempo.segundos })) }, [tempo.segundos, animado])
  const itens = [
    { l: 'Anos', v: display.anos, d: false }, { l: 'Meses', v: display.meses, d: false }, { l: 'Dias', v: display.dias, d: false },
    { l: 'Horas', v: display.horas, d: false }, { l: 'Min', v: display.minutos, d: false }, { l: 'Seg', v: display.segundos, d: true },
  ]
  return (
    <div ref={contadorRef} className="max-w-sm mx-auto space-y-3">
      {[0,3].map(off => (
        <div key={off} className="grid grid-cols-3 gap-3">
          {itens.slice(off, off+3).map(item => (
            <div key={item.l} className="text-center py-4 px-2 rounded-2xl" style={{
              background: item.d ? \`linear-gradient(135deg, \${cor}30, \${cor}15)\` : \`linear-gradient(135deg, \${cor}18, \${cor}08)\`,
              border: item.d ? \`1px solid \${cor}50\` : \`1px solid \${cor}25\`,
              transform: item.d ? 'scale(1.02)' : 'none',
            }}>
              <p className={\`\${off===0?'text-4xl':'text-3xl'} font-black leading-none tabular-nums\`} style={{ color: item.d ? cor : 'white' }}>
                {String(item.v).padStart(2,'0')}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 uppercase tracking-widest">{item.l}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}`;
  c = c.slice(0, contStart) + replacement + c.slice(contEnd);
  console.log('1. ContadorTempo: OK');
}

// 2. TIMELINE VIVA — add TimelineLine component after Secao
if (!c.includes('function TimelineLine')) {
  const secaoEnd = findFuncEnd(c, 'Secao');
  if (secaoEnd) {
    const comp = `

// Timeline line scroll-driven
function TimelineLine({ cor }: { cor: string }) {
  const lineRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: lineRef, offset: ['start center', 'end center'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 60, damping: 20 })
  return (
    <div ref={lineRef} className="absolute left-7 top-0 bottom-0 w-0.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <motion.div className="w-full origin-top" style={{ scaleY, height: '100%', background: \`linear-gradient(to bottom, \${cor}, \${cor}80)\` }} />
    </div>
  )
}`;
    c = c.slice(0, secaoEnd) + comp + c.slice(secaoEnd);
    console.log('2a. TimelineLine component: OK');
  }
}
// Replace old timeline line
const oldLineClass = 'className="absolute left-7 top-0 bottom-0 w-0.5 origin-top"';
if (c.includes(oldLineClass)) {
  const motionStart = c.lastIndexOf('<motion.div', c.indexOf(oldLineClass));
  const motionEnd = c.indexOf('/>', motionStart) + 2;
  c = c.slice(0, motionStart) + '<TimelineLine cor={cor} />' + c.slice(motionEnd);
  console.log('2b. Timeline line replaced: OK');
}

// 3. PLAYER BLUR
const playerDiv = '<div className="rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto border border-white/8"';
if (c.includes(playerDiv) && !c.includes('blur-[30px] scale-150')) {
  const styleEnd = c.indexOf('>', c.indexOf(playerDiv)) + 1;
  const fullTag = c.slice(c.indexOf(playerDiv), styleEnd);
  c = c.replace(fullTag, fullTag + `
      {dados.capa && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dados.capa} alt="" className="w-full h-full object-cover blur-[30px] scale-150 opacity-25" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}`);
  // Add 'relative' to the div
  c = c.replace('rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto border border-white/8"', 'relative rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto border border-white/8"');
  console.log('3. Player blur: OK');
}

// 4. CARTA SELADA
if (!c.includes('function CartaSelada')) {
  const exportIdx = c.indexOf('export default function PaginaCliente');
  const carta = `
// Carta selada com typing
function CartaSelada({ mensagem, cor, fontCorpo }: { mensagem: string; cor: string; fontCorpo: string }) {
  const [aberta, setAberta] = useState(false)
  const [txt, setTxt] = useState('')
  const started = useRef(false)
  useEffect(() => {
    if (!aberta || started.current) return
    started.current = true
    let i = 0
    const iv = setInterval(() => { i++; setTxt(mensagem.slice(0,i)); if (i>=mensagem.length) clearInterval(iv) }, 35)
    return () => clearInterval(iv)
  }, [aberta, mensagem])
  if (!aberta) return (
    <motion.button onClick={() => setAberta(true)} whileTap={{ scale: 0.97 }}
      className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 py-10 px-6 rounded-3xl border-2 border-dashed cursor-pointer"
      style={{ borderColor: \`\${cor}40\`, background: \`\${cor}08\` }}>
      <div className="w-16 h-12 relative">
        <div className="absolute inset-0 rounded-lg" style={{ background: \`\${cor}20\`, border: \`2px solid \${cor}40\` }} />
        <div className="absolute top-0 left-0 right-0 h-6" style={{ background: \`\${cor}15\`, clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: cor }}>Toque para abrir a carta</p>
    </motion.button>
  )
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto rounded-3xl p-8 border" style={{ background: \`\${cor}08\`, borderColor: \`\${cor}20\` }}>
      <p className="text-lg leading-relaxed whitespace-pre-wrap" style={{ fontFamily: fontCorpo, color: 'rgba(255,255,255,0.85)' }}>
        {txt}{txt.length < mensagem.length && <span className="inline-block w-0.5 h-5 ml-0.5 animate-pulse" style={{ background: cor }} />}
      </p>
    </motion.div>
  )
}

`;
  c = c.slice(0, exportIdx) + carta + c.slice(exportIdx);
  console.log('4. CartaSelada: OK');
}
// Integrate
if (c.includes('{pagina.mensagem}') && !c.includes('CartaSelada mensagem=')) {
  c = c.replace('{pagina.mensagem}', "{pagina.tipo === 'casal' ? '' : pagina.mensagem}");
  const afterMsg = c.indexOf("{pagina.tipo === 'casal' ? '' : pagina.mensagem}");
  const closingP = c.indexOf('</p>', afterMsg);
  const insertAt = c.indexOf('\n', closingP);
  const fonteVar = 'fontes.corpo';
  c = c.slice(0, insertAt) + `\n            {pagina.tipo === 'casal' && <CartaSelada mensagem={pagina.mensagem} cor={cor} fontCorpo={${fonteVar}} />}` + c.slice(insertAt);
  console.log('4b. CartaSelada integrated: OK');
}

// 5. BOTAO REACAO
if (!c.includes('function BotaoReacao')) {
  const cartaIdx = c.indexOf('// Carta selada');
  const botao = `// Botao reacao com confetti
function BotaoReacao({ cor }: { cor: string }) {
  const [curtidas, setCurtidas] = useState(0)
  const [pts, setPts] = useState<Array<{id:number;x:number;y:number}>>([])
  function handleCurtir() {
    setCurtidas(p => p + 1)
    const novas = Array.from({length:12},(_,i) => ({ id: Date.now()+i, x: (Math.random()-0.5)*120, y: -(Math.random()*80+30) }))
    setPts(novas); setTimeout(() => setPts([]), 1500)
  }
  return (
    <div className="flex flex-col items-center gap-2 relative">
      <motion.button onClick={handleCurtir} whileTap={{ scale: 0.85 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: \`linear-gradient(135deg, \${cor}, \${cor}aa)\` }}>
        <Heart className="w-6 h-6 text-white fill-white" />
        {pts.map(p => (
          <motion.div key={p.id} className="absolute w-2 h-2 rounded-full" style={{ background: cor }}
            initial={{ x:0, y:0, opacity:1 }} animate={{ x:p.x, y:p.y, opacity:0 }} transition={{ duration:1 }} />
        ))}
      </motion.button>
      {curtidas > 0 && <span className="text-xs text-gray-500">{curtidas}</span>}
    </div>
  )
}

`;
  c = c.slice(0, cartaIdx) + botao + c.slice(cartaIdx);
  console.log('5. BotaoReacao: OK');
}
if (!c.includes('<BotaoReacao')) {
  const cartaUse = c.indexOf("CartaSelada mensagem=");
  if (cartaUse !== -1) {
    const lineEnd = c.indexOf('\n', c.indexOf('/>', cartaUse));
    c = c.slice(0, lineEnd) + '\n            <div className="flex justify-center mt-8"><BotaoReacao cor={cor} /></div>' + c.slice(lineEnd);
    console.log('5b. BotaoReacao integrated: OK');
  }
}

// 6. GLINT FORMATURA
const cursoH2 = 'font-black">{pagina.dados_formatura.curso}';
if (c.includes(cursoH2) && !c.includes('glint-effect">{pagina.dados_formatura.curso}')) {
  c = c.replace(cursoH2, 'font-black glint-effect">{pagina.dados_formatura.curso}');
  console.log('6. Glint formatura: OK');
}

// 7. MUSIC FIX
c = c.replace("audio.play().then(() => setTocando(true)).catch(() => {})", "setTocando(false)");
c = c.replace("else { audio.play(); setTocando(true) }", "else { audio.play().then(() => setTocando(true)).catch(() => {}) }");

// 8. GUESTBOOK MASONRY
if (c.includes('className="space-y-4"') && c.indexOf('className="space-y-4"', c.indexOf('Livro de Visitas')) !== -1) {
  const gbStart = c.indexOf('Livro de Visitas');
  const spaceY = c.indexOf('className="space-y-4"', gbStart);
  if (spaceY !== -1 && spaceY - gbStart < 2000) {
    c = c.slice(0, spaceY) + 'className="columns-1 sm:columns-2 gap-4 space-y-4"' + c.slice(spaceY + 'className="space-y-4"'.length);
    console.log('8. Guestbook masonry: OK');
  }
}

// VERIFY
const funcs = ['ContadorTempo','ParallaxLayer','PlayerMusica','SlideMemoria','CartaSelada','BotaoReacao','TimelineLine','PaginaCliente','Secao'];
console.log('\n--- Verify ---');
funcs.forEach(f => console.log(`${c.includes('function '+f)?'OK':'MISS'}: ${f}`));
console.log('use client:', c.startsWith("'use client'") ? 'OK' : 'BROKEN');
console.log('Size:', Math.round(c.length/1024)+'KB');

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
