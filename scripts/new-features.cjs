const fs = require('fs');
let pc = fs.readFileSync('src/app/p/[slug]/PaginaCliente.tsx', 'utf8');

// ===== 1. ADD BUCKET LIST COMPONENT =====
if (!pc.includes('function BucketList')) {
  const exportIdx = pc.indexOf('export default function PaginaCliente');
  const comp = `
// Bucket List interativa
function BucketList({ items, cor }: { items: Array<{texto: string; feito: boolean}>; cor: string }) {
  const [lista, setLista] = useState(items)

  function toggle(i: number) {
    setLista(prev => prev.map((item, idx) => idx === i ? { ...item, feito: !item.feito } : item))
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
      {lista.map((item, i) => (
        <motion.button key={i} onClick={() => toggle(i)}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all"
          style={{
            background: item.feito ? \`\${cor}15\` : 'rgba(255,255,255,0.03)',
            border: \`1px solid \${item.feito ? cor + '40' : 'rgba(255,255,255,0.08)'}\`,
          }}>
          <div className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all \${item.feito ? 'scale-110' : ''}\`}
            style={{ borderColor: item.feito ? cor : 'rgba(255,255,255,0.2)', background: item.feito ? cor : 'transparent' }}>
            {item.feito && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>}
          </div>
          <span className={\`text-sm transition-all \${item.feito ? 'line-through text-gray-500' : 'text-white'}\`}>
            {item.texto}
          </span>
        </motion.button>
      ))}
    </div>
  )
}

// Capsula de audio com ducking
function CapsulaAudio({ audioUrl, mensagem, cor, fontes, audioRef: musicRef }: {
  audioUrl: string; mensagem: string; cor: string; fontes: { titulo: string; corpo: string }
  audioRef: React.RefObject<HTMLAudioElement | null>
}) {
  const [tocando, setTocando] = useState(false)
  const [texto, setTexto] = useState('')
  const vozRef = useRef<HTMLAudioElement | null>(null)
  const started = useRef(false)

  function iniciar() {
    if (started.current) return
    started.current = true
    const audio = new Audio(audioUrl)
    audio.setAttribute('playsinline', 'true')
    vozRef.current = audio

    // Duck music volume
    if (musicRef.current) musicRef.current.volume = 0.15

    audio.play().then(() => {
      setTocando(true)
      // Typing effect
      let i = 0
      const iv = setInterval(() => {
        i++
        setTexto(mensagem.slice(0, i))
        if (i >= mensagem.length) clearInterval(iv)
      }, 40)
    }).catch(() => {})

    audio.onended = () => {
      setTocando(false)
      if (musicRef.current) musicRef.current.volume = 0.5
    }
  }

  if (!tocando && !started.current) {
    return (
      <div className="text-center">
        <p className="text-lg text-white/60 mb-6 italic" style={{ fontFamily: fontes.titulo }}>
          Feche os olhos, ou apenas leia.
        </p>
        <motion.button onClick={iniciar} whileTap={{ scale: 0.95 }}
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
          style={{ background: \`linear-gradient(135deg, \${cor}, \${cor}88)\`, boxShadow: \`0 0 40px \${cor}40\` }}>
          <Play className="w-8 h-8 text-white ml-1" />
        </motion.button>
        <p className="text-xs text-gray-600 mt-4">Ouvir mensagem de voz</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto text-center">
      {/* Waveform visual */}
      <div className="flex items-center justify-center gap-1 mb-8">
        {[...Array(20)].map((_, i) => (
          <motion.div key={i} className="w-1 rounded-full" style={{ background: cor }}
            animate={tocando ? { height: [8, 16 + Math.random() * 20, 8] } : { height: 4 }}
            transition={tocando ? { duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.05 } : {}} />
        ))}
      </div>
      {/* Typing text */}
      <p className="text-xl leading-relaxed whitespace-pre-wrap" style={{ fontFamily: fontes.corpo, color: 'rgba(255,255,255,0.85)' }}>
        {texto}
        {texto.length < mensagem.length && <span className="inline-block w-0.5 h-6 ml-0.5 animate-pulse" style={{ background: cor }} />}
      </p>
    </div>
  )
}

`;
  pc = pc.slice(0, exportIdx) + comp + pc.slice(exportIdx);
  console.log('1. BucketList + CapsulaAudio components: OK');
}

// ===== 2. ADD INTERFACES =====
// Add bucket_list and audio_mensagem to Pagina interface
if (!pc.includes('bucket_list')) {
  pc = pc.replace(
    "dados_formatura?: DadosFormatura | null\n}",
    "dados_formatura?: DadosFormatura | null\n  bucket_list?: Array<{texto: string; feito: boolean}> | null\n  audio_mensagem?: string | null\n  locais?: Array<{titulo: string; descricao: string; lat: number; lng: number; fotos: string[]}> | null\n}"
  );
  console.log('2. Pagina interface: updated');
}

// ===== 3. ADD SECTIONS IN RENDER =====
// Add Bucket List before Guestbook
const guestbookSection = pc.indexOf('{/* ===== LIVRO DE VISITAS =====');
if (guestbookSection !== -1 && !pc.includes('BucketList items=')) {
  const bucketSection = `
        {/* ===== BUCKET LIST ===== */}
        {pagina.bucket_list && pagina.bucket_list.length > 0 && (
          <section className="py-20 px-4">
            <Secao className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black" style={{ fontFamily: fontes.titulo }}>O que vamos viver</h2>
              <p className="text-gray-500 text-sm mt-2">Nossos planos e sonhos juntos</p>
            </Secao>
            <Secao delay={0.2}>
              <BucketList items={pagina.bucket_list} cor={cor} />
            </Secao>
          </section>
        )}

        {/* ===== CAPSULA DE AUDIO ===== */}
        {pagina.audio_mensagem && (
          <section className="py-24 px-4" style={{ background: '#000000' }}>
            <Secao>
              <CapsulaAudio audioUrl={pagina.audio_mensagem} mensagem={pagina.mensagem} cor={cor} fontes={fontes} audioRef={audioRef} />
            </Secao>
          </section>
        )}

`;
  pc = pc.slice(0, guestbookSection) + bucketSection + pc.slice(guestbookSection);
  console.log('3. Bucket + Audio sections in render: OK');
}

// ===== 4. ADD audioRef to main component =====
if (!pc.includes('const audioRef = useRef') || pc.indexOf('audioRef') === pc.indexOf('audioRef.current')) {
  // Check if audioRef already exists in PaginaCliente
  const mainFunc = pc.indexOf('export default function PaginaCliente');
  const existingAudioRef = pc.indexOf('audioRef', mainFunc);
  if (existingAudioRef === -1 || existingAudioRef > mainFunc + 2000) {
    // Add audioRef near the top of PaginaCliente
    const afterContainerRef = pc.indexOf('const containerRef', mainFunc);
    if (afterContainerRef !== -1) {
      const lineEnd = pc.indexOf('\n', afterContainerRef);
      pc = pc.slice(0, lineEnd) + '\n  const audioRef = useRef<HTMLAudioElement | null>(null)' + pc.slice(lineEnd);
      console.log('4. audioRef in PaginaCliente: OK');
    }
  }
}

fs.writeFileSync('src/app/p/[slug]/PaginaCliente.tsx', pc, 'utf8');

// ===== 5. ADD FORM FIELDS IN CRIAR =====
let criar = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// Add bucket_list to FormData interface
if (!criar.includes('bucketList')) {
  criar = criar.replace(
    "dadosCasal: DadosCasal; dadosFormatura: DadosFormatura\n}",
    "dadosCasal: DadosCasal; dadosFormatura: DadosFormatura\n  bucketList: Array<{texto: string; feito: boolean}>\n}"
  );
  
  // Add to initial state
  criar = criar.replace(
    "dadosCasal: { nome1: ''",
    "bucketList: [],\n      dadosCasal: { nome1: ''"
  );

  // Add to FormData submission
  criar = criar.replace(
    "fd.append('dadosFormatura', JSON.stringify(form.dadosFormatura))",
    "fd.append('dadosFormatura', JSON.stringify(form.dadosFormatura))\n      fd.append('bucketList', JSON.stringify(form.bucketList))"
  );
  
  console.log('5. Bucket list in criar form: OK');
}

fs.writeFileSync('src/app/criar/page.tsx', criar, 'utf8');

// ===== 6. HANDLE BUCKET LIST IN API =====
let api = fs.readFileSync('src/app/api/criar/route.ts', 'utf8');
if (!api.includes('bucket_list')) {
  // Parse bucket list from form data
  api = api.replace(
    "const fotosLegendas = parseJsonSeguro",
    "const bucketList = parseJsonSeguro<Array<{texto: string; feito: boolean}>>(fd.get('bucketList') as string, [])\n    const fotosLegendas = parseJsonSeguro"
  );
  
  // Add to insert
  api = api.replace(
    "email_cliente: emailCliente,",
    "bucket_list: bucketList.slice(0, 20).map(b => ({ texto: sanitize(String(b.texto || '')).slice(0, 100), feito: Boolean(b.feito) })),\n      email_cliente: emailCliente,"
  );
  
  console.log('6. API bucket_list: OK');
}
fs.writeFileSync('src/app/api/criar/route.ts', api, 'utf8');

console.log('\nAll new features integrated.');
console.log('Remaining: Add bucket list UI step in criar form (PassoBucketList)');
