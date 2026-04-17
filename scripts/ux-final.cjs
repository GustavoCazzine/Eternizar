const fs = require('fs');
let c = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// Find ContadorTempo: skip params, find body brace
const funcStart = c.indexOf('function ContadorTempo');
// Find the closing ) of params first
let parenDepth = 0;
let i = c.indexOf('(', funcStart);
do {
  if (c[i] === '(') parenDepth++;
  else if (c[i] === ')') parenDepth--;
  i++;
} while (parenDepth > 0);

// Now find opening { of function body
const bodyStart = c.indexOf('{', i);
let depth = 1;
let j = bodyStart + 1;
while (j < c.length && depth > 0) {
  if (c[j] === '{') depth++;
  else if (c[j] === '}') depth--;
  j++;
}

// Include comment before
let commentStart = funcStart;
const prevLine = c.lastIndexOf('\n', funcStart - 1);
const line = c.slice(c.lastIndexOf('\n', prevLine - 1) + 1, prevLine).trim();
if (line.startsWith('//')) commentStart = c.lastIndexOf('\n', prevLine - 1) + 1;

console.log('Range:', commentStart, '-', j, '(' + (j - commentStart) + ' chars)');
console.log('After:', c.slice(j, j + 60));

// Replace
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
        anos: Math.floor(diasT / 365), meses: Math.floor((diasT % 365) / 30),
        dias: diasT % 30, horas: hrs % 24, minutos: min % 60, segundos: seg % 60,
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
        const t0 = performance.now()
        function tick(now: number) {
          const p = Math.min((now - t0) / 1800, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setDisplay({
            anos: Math.round(target.anos * ease), meses: Math.round(target.meses * ease),
            dias: Math.round(target.dias * ease), horas: Math.round(target.horas * ease),
            minutos: Math.round(target.minutos * ease), segundos: target.segundos,
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
    { label: 'Anos', valor: display.anos, dest: false },
    { label: 'Meses', valor: display.meses, dest: false },
    { label: 'Dias', valor: display.dias, dest: false },
    { label: 'Horas', valor: display.horas, dest: false },
    { label: 'Min', valor: display.minutos, dest: false },
    { label: 'Seg', valor: display.segundos, dest: true },
  ]

  return (
    <div ref={contadorRef} className="max-w-sm mx-auto space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {itens.slice(0, 3).map((item) => (
          <div key={item.label} className="text-center py-5 px-2 rounded-2xl"
            style={{ background: \`linear-gradient(135deg, \${cor}18, \${cor}08)\`, border: \`1px solid \${cor}25\` }}>
            <p className="text-4xl font-black leading-none text-white tabular-nums">{String(item.valor).padStart(2, '0')}</p>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {itens.slice(3).map((item) => (
          <div key={item.label} className="text-center py-4 px-2 rounded-2xl"
            style={{
              background: item.dest ? \`linear-gradient(135deg, \${cor}30, \${cor}15)\` : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
              border: item.dest ? \`1px solid \${cor}50\` : '1px solid rgba(255,255,255,0.08)',
              transform: item.dest ? 'scale(1.02)' : 'none',
            }}>
            <p className="text-3xl font-black leading-none tabular-nums" style={{ color: item.dest ? cor : 'white' }}>
              {String(item.valor).padStart(2, '0')}
            </p>
            <p className="text-xs text-gray-500 mt-1.5 uppercase tracking-widest">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}`;

c = c.slice(0, commentStart) + newContador + c.slice(j);
console.log('Replaced ContadorTempo');

// Add CartaSelada before export
if (!c.includes('function CartaSelada')) {
  const exportIdx = c.indexOf('export default function PaginaCliente');
  const carta = `
// Carta selada com typing effect
function CartaSelada({ mensagem, cor, fontCorpo }: { mensagem: string; cor: string; fontCorpo: string }) {
  const [aberta, setAberta] = useState(false)
  const [textoVisivel, setTextoVisivel] = useState('')
  const digitandoRef = useRef(false)

  useEffect(() => {
    if (!aberta || digitandoRef.current) return
    digitandoRef.current = true
    let i = 0
    const interval = setInterval(() => {
      i++
      setTextoVisivel(mensagem.slice(0, i))
      if (i >= mensagem.length) { clearInterval(interval); digitandoRef.current = false }
    }, 35)
    return () => clearInterval(interval)
  }, [aberta, mensagem])

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
      </motion.button>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto rounded-3xl p-8 border" style={{ background: \`\${cor}08\`, borderColor: \`\${cor}20\` }}>
      <p className="text-lg leading-relaxed whitespace-pre-wrap" style={{ fontFamily: fontCorpo, color: 'rgba(255,255,255,0.85)' }}>
        {textoVisivel}
        {digitandoRef.current && <span className="inline-block w-0.5 h-5 ml-0.5 animate-pulse" style={{ background: cor }} />}
      </p>
    </motion.div>
  )
}

`;
  c = c.slice(0, exportIdx) + carta + c.slice(exportIdx);
  console.log('Added CartaSelada');
}

// Integrate CartaSelada for casal mensagem
if (c.includes('{pagina.mensagem}') && !c.includes('CartaSelada mensagem=')) {
  c = c.replace('{pagina.mensagem}', "{pagina.tipo === 'casal' ? '' : pagina.mensagem}");
  const afterMsg = c.indexOf("{pagina.tipo === 'casal' ? '' : pagina.mensagem}");
  const closingP = c.indexOf('</p>', afterMsg);
  const insertAt = c.indexOf('\n', closingP);
  c = c.slice(0, insertAt) + "\n            {pagina.tipo === 'casal' && <CartaSelada mensagem={pagina.mensagem} cor={cor} fontCorpo={fontCorpo} />}" + c.slice(insertAt);
  console.log('Integrated CartaSelada');
}

// Fix autoplay
c = c.replace("audio.play().then(() => setTocando(true)).catch(() => {})", "setTocando(false)");
c = c.replace("else { audio.play(); setTocando(true) }", "else { audio.play().then(() => setTocando(true)).catch(() => {}) }");

// Verify
const funcs = ['ContadorTempo','ParallaxLayer','PlayerMusica','SlideMemoria','CartaSelada','PaginaCliente','Secao'];
console.log('\n--- Verify ---');
funcs.forEach(f => console.log(`${c.includes('function '+f)?'OK':'MISS'}: ${f}`));

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', c, 'utf8');
