'use client'
      


import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Heart, Calendar, ArrowDown, Play, Pause, Volume2, Images, MessageCircle, Send, MapPin as MapPinIcon, Utensils, Film } from 'lucide-react'
import StoriesViewer from '@/components/StoriesViewer'
import EternizarWrapped from '@/components/EternizarWrapped'
import CuriosidadesMagicas from '@/components/CuriosidadesMagicas'
import dynamic from 'next/dynamic'
const MapaAmor = dynamic(() => import('@/components/MapaAmor'), { ssr: false, loading: () => <div className="h-[400px] rounded-2xl" style={{ background: 'radial-gradient(circle, rgba(155,27,48,0.05), #1a1a2e)' }} /> })
import EmojiAnimado from '@/components/EmojiAnimado'

interface MusicaDados {
 nome: string
 artista: string
 album: string
 capa: string
 previewUrl: string | null
 duracaoMs: number
}

interface Foto {
 url: string
 legenda?: string
 isCapa?: boolean
}

interface Evento {
 data: string
 titulo: string
 descricao?: string
 emoji: string
 fotoUrl?: string
}

interface DadosCasal {
 nome1: string
 nome2: string
 dataInicio: string
 apelido1: string
 apelido2: string
 cidadePrimeiroEncontro: string
 comeFavorita: string
 filmeFavorito: string
 musicaFavorita: string
 comoSeConheceram: string
}

interface DadosFormatura {
 curso: string
 instituicao: string
 anoFormatura: string
 nomeTurma: string
 quantidadeAlunos: string
 casaisFormados: string
}

interface Pagina {
 slug: string
 tipo: string
 titulo: string
 subtitulo?: string
 mensagem: string
 musica_nome?: string
 musica_dados?: MusicaDados | null
 cor_tema: string
 fonte_par?: string
 compartilhavel?: boolean
 fotos: Foto[] | string[]
 linha_do_tempo: Evento[]
 senha_hash?: string
 senha_dica?: string
 dados_casal?: DadosCasal | null
 dados_formatura?: DadosFormatura | null
}

// Paletas de cor completas
const paletas: Record<string, { primaria: string; secundaria: string; brilho: string; fundo: string; fundoAlt: string; texto: string }> = {
 pink: { primaria: '#9B1B30', secundaria: '#B91C3C', brilho: '#e8a0b0', fundo: '#030303', fundoAlt: '#050505', texto: '#f5e0e8' },
 violet: { primaria: '#8b5cf6', secundaria: '#7c3aed', brilho: '#c4b5fd', fundo: '#030303', fundoAlt: '#050505', texto: '#ede9fe' },
 amber: { primaria: '#f59e0b', secundaria: '#f97316', brilho: '#fcd34d', fundo: '#030303', fundoAlt: '#050505', texto: '#fef3c7' },
 blue: { primaria: '#3b82f6', secundaria: '#06b6d4', brilho: '#93c5fd', fundo: '#030303', fundoAlt: '#050505', texto: '#dbeafe' },
 emerald: { primaria: '#10b981', secundaria: '#14b8a6', brilho: '#6ee7b7', fundo: '#030303', fundoAlt: '#050505', texto: '#d1fae5' },
 rose: { primaria: '#C2185B', secundaria: '#9B1B30', brilho: '#fda4af', fundo: '#030303', fundoAlt: '#050505', texto: '#ffe4e6' },
}

const paresFonte: Record<string, { titulo: string; corpo: string }> = {
  classico:  { titulo: 'system-ui, -apple-system, sans-serif', corpo: 'system-ui, -apple-system, sans-serif' },
  moderno:   { titulo: 'system-ui, -apple-system, sans-serif', corpo: 'system-ui, -apple-system, sans-serif' },
  romantico: { titulo: 'system-ui, -apple-system, sans-serif', corpo: 'system-ui, -apple-system, sans-serif' },
  divertido: { titulo: 'system-ui, -apple-system, sans-serif', corpo: 'system-ui, -apple-system, sans-serif' },
}

// Componente de seção com entrada animada
function Secao({ children, className = '', delay = 0 }: {
 children: React.ReactNode; className?: string; delay?: number
}) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 60 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: '-60px' }}
 transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
 className={className}
 >
 {children}
 </motion.div>
 )
}

// Timeline line scroll-driven
function TimelineLine({ cor }: { cor: string }) {
 const lineRef = useRef<HTMLDivElement>(null)
 const { scrollYProgress } = useScroll({ target: lineRef, offset: ['start center', 'end center'] })
 const scaleY = useSpring(scrollYProgress, { stiffness: 60, damping: 20 })
 return (
 <div ref={lineRef} className="absolute left-7 top-0 bottom-0 w-0.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
 <motion.div className="w-full origin-top" style={{ scaleY, height: '100%', background: `linear-gradient(to bottom, ${cor}, ${cor}80)` }} />
 </div>
 )
}

// Contador com efeito odometro
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
 style={{ background: `linear-gradient(135deg, ${cor}18, ${cor}08)`, border: `1px solid ${cor}25` }}>
 <p className="text-4xl font-black leading-none text-white tabular-nums">{String(item.valor).padStart(2, '0')}</p>
 <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">{item.label}</p>
 </div>
 ))}
 </div>
 <div className="grid grid-cols-3 gap-3">
 {itens.slice(3).map((item) => (
 <div key={item.label} className="text-center py-4 px-2 rounded-2xl"
 style={{
 background: item.dest ? `linear-gradient(135deg, ${cor}30, ${cor}15)` : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
 border: item.dest ? `1px solid ${cor}50` : '1px solid rgba(255,255,255,0.08)',
 animation: item.dest ? 'pulse-second 1s ease-in-out infinite' : 'none',
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
}

// Efeito de parallax em camadas estilo iPhone
function ParallaxLayer({ children, speed = 0.3, className = '' }: {
 children: React.ReactNode; speed?: number; className?: string
}) {
 const ref = useRef<HTMLDivElement>(null)
 const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
 const rawY = useTransform(scrollYProgress, [0, 1], [`${speed * -50}%`, `${speed * 50}%`])
 const y = useSpring(rawY, { stiffness: 100, damping: 30 })

 return (
 <div ref={ref} className={`overflow-hidden ${className}`}>
 <motion.div style={{ y }} className="w-full h-full">
 {children}
 </motion.div>
 </div>
 )
}

// Mini player inline
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
    <div className="flex items-center gap-4 max-w-md mx-auto p-4">
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
          <div className="h-full rounded-full transition-all" style={{ width: `${progresso}%`, backgroundColor: cor }} />
        </div>
      </div>
    </div>
  )
}

// Slide de foto com parallax, legenda e texto
function SlideMemoria({
 foto, legenda, index, cor, total
}: {
 foto: string; legenda?: string; index: number; cor: string; total: number
}) {
 const par = index % 2 === 0

 return (
 <motion.div
 initial={{ opacity: 0 }}
 whileInView={{ opacity: 1 }}
 viewport={{ once: true, margin: '-80px' }}
 transition={{ duration: 1.2 }}
 className="relative min-h-[85vh] flex items-end pb-16"
 >
 {/* Foto de fundo com parallax */}
 <div className="absolute inset-0 rounded-3xl overflow-hidden">
 <div className="absolute inset-0">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={foto} alt={legenda || `Memória ${index + 1}`}
 className="w-full h-full object-cover" style={{ transform: 'scale(1.15)' }} />
 </div>
 {/* Gradiente */}
 <div className="absolute inset-0" style={{
 background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)'
 }} />
 </div>

 {/* Conteúdo na parte inferior */}
 <div className="relative z-10 px-8 w-full">
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.7, delay: 0.3 }}
 >
 {/* Número decorativo */}
 <p className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: `${cor}99` }}>
 {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
 </p>
 {/* Legenda */}
 {legenda && (
 <h3 className="text-2xl font-bold text-white leading-tight max-w-lg">{legenda}</h3>
 )}
 {/* Linha */}
 <div className="w-10 h-0.5 mt-3" style={{ backgroundColor: cor }} />
 </motion.div>
 </div>
 </motion.div>
 )
}


// Botao de reacao afetiva com confetti
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
 style={{ background: `linear-gradient(135deg, ${cor}, ${cor}aa)` }}>
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
 className="w-full max-w-sm mx-auto flex flex-col items-center gap-3 py-6 px-5 rounded-2xl border border-dashed cursor-pointer"
 style={{ borderColor: `${cor}40`, background: `${cor}08` }}>
 <div className="flex items-center justify-center">
 
 <svg className="w-10 h-10" style={{ color: cor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
 </div>
 <p className="text-sm font-medium" style={{ color: cor }}>Toque para abrir a carta</p>
 </motion.button>
 )
 }

 return (
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
 className="max-w-lg mx-auto rounded-2xl p-8 min-h-[240px]" style={{ background: '#000', borderLeft: `4px solid ${cor}`, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
 <p className="text-lg leading-relaxed whitespace-pre-wrap" style={{ fontFamily: fontCorpo, color: 'rgba(255,255,255,0.85)' }}>
 {textoVisivel}
 {digitandoRef.current && <span className="inline-block w-0.5 h-5 ml-0.5 animate-pulse" style={{ background: cor }} />}
 </p>
 </motion.div>
 )
}


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
            background: item.feito ? `${cor}15` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${item.feito ? cor + '40' : 'rgba(255,255,255,0.08)'}`,
          }}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${item.feito ? 'scale-110' : ''}`}
            style={{ borderColor: item.feito ? cor : 'rgba(255,255,255,0.2)', background: item.feito ? cor : 'transparent' }}>
            {item.feito && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>}
          </div>
          <span className={`text-sm transition-all ${item.feito ? 'line-through text-gray-500' : 'text-white'}`}>
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
        <p className="text-lg text-white/60 mb-6 italic" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Feche os olhos, ou apenas leia.
        </p>
        <motion.button onClick={iniciar} whileTap={{ scale: 0.95 }}
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${cor}, ${cor}88)`, boxShadow: `0 0 40px ${cor}40` }}>
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
      <p className="text-xl leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: 'rgba(255,255,255,0.85)' }}>
        {texto}
        {texto.length < mensagem.length && <span className="inline-block w-0.5 h-6 ml-0.5 animate-pulse" style={{ background: cor }} />}
      </p>
    </div>
  )
}

export default function PaginaCliente({ pagina }: { pagina: Pagina }) {
 const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [showWrapped, setShowWrapped] = useState(true)
 const { scrollYProgress } = useScroll()
 const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
 const [senhaInput, setSenhaInput] = useState('')
 const [liberada, setLiberada] = useState(!pagina.senha_hash)
 const [erroSenha, setErroSenha] = useState(false)
 const [storiesAberto, setStoriesAberto] = useState(false)
 const [storyInicial, setStoryInicial] = useState(0)

 // Guestbook
 const [guestMsgs, setGuestMsgs] = useState<{id: string; nome: string; mensagem: string; created_at: string; aprovado?: boolean}[]>([])
 const [ehDono, setEhDono] = useState(false)
 const [guestNome, setGuestNome] = useState('')
 const [guestMsg, setGuestMsg] = useState('')
 const [guestEnviando, setGuestEnviando] = useState(false)
 const [guestSucesso, setGuestSucesso] = useState(false)
 const [guestPendente, setGuestPendente] = useState(false)
 const [guestErro, setGuestErro] = useState('')

 // Carregar mensagens do guestbook

  useEffect(() => {
    document.body.style.overflow = showWrapped ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [showWrapped])

  useEffect(() => {
 fetch(`/api/guestbook?slug=${encodeURIComponent(pagina.slug)}`)
 .then(r => r.json())
 .then(d => {
 if (d.mensagens) setGuestMsgs(d.mensagens)
 if (d.ehDono) setEhDono(true)
 })
 .catch(() => {})
 }, [pagina.slug])

 async function aprovarMsg(id: string, aprovar: boolean) {
 const res = await fetch('/api/guestbook', {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ id, aprovar })
 })
 if (res.ok) {
 setGuestMsgs(prev => prev.map(m => m.id === id ? { ...m, aprovado: aprovar } : m))
 }
 }

 async function deletarMsg(id: string) {
 if (!confirm('Remover esta mensagem?')) return
 const res = await fetch(`/api/guestbook?id=${id}`, { method: 'DELETE' })
 if (res.ok) {
 setGuestMsgs(prev => prev.filter(m => m.id !== id))
 }
 }

 async function enviarGuestbook() {
 if (!guestNome.trim() || !guestMsg.trim()) return
 setGuestEnviando(true)
 setGuestErro('')
 try {
 const res = await fetch('/api/guestbook', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ slug: pagina.slug, nome: guestNome.trim(), mensagem: guestMsg.trim() })
 })
 const data = await res.json()
 if (res.ok && data.sucesso) {
 setGuestNome('')
 setGuestMsg('')
 setGuestSucesso(true)
 setGuestPendente(true)
 setTimeout(() => { setGuestSucesso(false); setGuestPendente(false) }, 5000)
 } else {
 setGuestErro(data.erro || 'Erro ao enviar')
 }
 } catch {
 setGuestErro('Erro de conexão')
 }
 setGuestEnviando(false)
 }

 // Normaliza fotos para array de objetos
 const todasFotos = (pagina.fotos || []).map(f =>
 typeof f === 'string' ? { url: f, legenda: '' } : f
 )
 const fotoCapa = todasFotos.find(f => f.isCapa)?.url || todasFotos[0]?.url || ''
 const fotosNormalizadas = todasFotos.filter(f => !f.isCapa)

 const paleta = paletas[pagina.cor_tema] || paletas.pink
 const cor = paleta.primaria
 const corTexto = paleta.texto
 const fontes = { titulo: 'system-ui, -apple-system, sans-serif', corpo: 'system-ui, -apple-system, sans-serif' }

 const tipo = pagina.tipo
 const emoji = tipo === 'casal' ? '♥' : tipo === 'formatura' ? '★' : tipo === 'homenagem' ? '★' : ''

 async function verificarSenha() {
 const res = await fetch('/api/paginas/verificar-senha', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ slug: pagina.slug, senha: senhaInput })
 })
 if (res.ok) { setLiberada(true); setErroSenha(false) }
 else setErroSenha(true)
 }

 // Tela de senha
 if (!liberada) {
 return (
 <div className="min-h-screen text-white flex items-center justify-center px-4"
 style={{ background: '#000' }}>
 <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm w-full">
 <motion.div
 animate={{ rotate: [0, -10, 10, -10, 0] }}
 transition={{ duration: 1, delay: 0.5 }}
 className="text-6xl mb-6"
 >•</motion.div>
 <h1 className="text-3xl sm:text-4xl font-black mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Uma surpresa te espera</h1>
 
 <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>Responda para desbloquear</p>
 {pagina.senha_dica && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.3 }}
 className="mb-8"
 style={{ borderColor: `${cor}40` }}
 >
 <p className="text-xs mb-1 uppercase tracking-widest" style={{ color: cor }}>Dica</p>
 <p className="text-gray-300 italic">"{pagina.senha_dica}"</p>
 </motion.div>
 )}
 <input
 type="text"
 value={senhaInput}
 onChange={e => setSenhaInput(e.target.value)}
 onKeyDown={e => e.key === 'Enter' && verificarSenha()}
 placeholder="Sua resposta..."
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none mb-3 transition"
 style={{ borderColor: erroSenha ? '#f43f5e' : undefined }}
 />
 {erroSenha && (
 <motion.p
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 className="text-red-400 text-sm mb-3"
 >
 Hmm, não foi dessa vez. Tente novamente!
 </motion.p>
 )}
 <button
 onClick={verificarSenha}
 className="w-full py-4 rounded-full font-bold text-white transition hover:opacity-90"
 style={{ background: `linear-gradient(135deg, ${cor}, ${paleta.secundaria})` }}
 >
 Abrir surpresa
 </button>
 </motion.div>
 </div>
 )
 }

 return (
 <div ref={containerRef} className="text-white relative"
   style={{ background: '#000', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

   {showWrapped && pagina.tipo === 'casal' && (
     <EternizarWrapped
       titulo={pagina.titulo}
       dataInicio={pagina.dados_casal?.dataInicio}
       comidaFavorita={pagina.dados_casal?.comeFavorita}
       filmeFavorito={pagina.dados_casal?.filmeFavorito}
       cidadeEncontro={pagina.dados_casal?.cidadePrimeiroEncontro}
       musicaCapa={pagina.musica_dados?.capa}
       musicaNome={pagina.musica_dados?.nome}
       previewUrl={pagina.musica_dados?.previewUrl}
       cor={cor}
       onDesbloquear={() => setShowWrapped(false)}
     />
   )}

   {/* Progress bar */}
   <div className="fixed top-0 left-0 right-0 h-0.5 z-50" style={{ background: 'rgba(255,255,255,0.05)' }}>
     <motion.div style={{ width: progressWidth, backgroundColor: cor }} className="h-full" />
   </div>

   <style>{`
     @keyframes spin-slow { to { transform: rotate(360deg) } }
     @keyframes pulse-second { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
   `}</style>

   {/* ===== HERO ===== */}
   <section className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden">
     {fotoCapa && (
       <div className="absolute inset-0 pointer-events-none">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img src={fotoCapa} alt="" className="w-full h-full object-cover opacity-50" style={{ objectPosition: 'center 30%' }} />
         <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 50%, #000 100%)' }} />
       </div>
     )}
     <div className="relative z-10 text-center px-6 max-w-2xl">
       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="mb-8">
         <Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" style={{ color: cor, fill: cor }} />
       </motion.div>
       <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
         className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-4 sm:mb-6" style={{ color: cor }}>
         Uma surpresa especial para voce
       </motion.p>
       <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}
         className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight nome-capitalize">
         {pagina.titulo}
       </motion.h1>
       {pagina.subtitulo && (
         <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
           className="text-base sm:text-lg mt-4 sm:mt-6 nome-capitalize" style={{ color: 'rgba(255,255,255,0.6)' }}>
           {pagina.subtitulo}
         </motion.p>
       )}
     </div>
     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
       className="absolute bottom-8 left-1/2 -translate-x-1/2">
       <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}
         className="w-6 h-9 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
         <motion.div animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
           className="w-1 h-2 rounded-full bg-white/50" />
       </motion.div>
     </motion.div>
   </section>

   {/* ===== COUNTER ===== */}
   {pagina.tipo === 'casal' && pagina.dados_casal?.dataInicio && (
     <section className="min-h-[100dvh] flex items-center justify-center px-6 relative">
       <div className="absolute -top-20 -left-20 w-[300px] h-[300px] pointer-events-none opacity-[0.04]">
         <div className="absolute inset-0 animate-[spin-slow_40s_linear_infinite]">
           {[1,2,3,4].map(i => (<div key={i} className="absolute rounded-full border border-white" style={{ inset: i*35 }} />))}
         </div>
       </div>
       <Secao className="text-center max-w-xl w-full">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12" style={{ color: cor }}>Contando cada segundo</p>
         <ContadorTempo dataInicio={pagina.dados_casal.dataInicio} cor={cor} paleta={paleta} />
         {pagina.musica_dados?.previewUrl && (
           <Secao delay={0.3} className="mt-12 sm:mt-16">
             <div className="flex items-center gap-4 max-w-sm mx-auto">
               <button onClick={() => {
                 if (!audioRef.current) { audioRef.current = new Audio(pagina.musica_dados!.previewUrl!); audioRef.current.volume = 0.5; audioRef.current.loop = true }
                 if (audioRef.current.paused) audioRef.current.play().catch(() => {}); else audioRef.current.pause()
               }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0"
                 style={{ background: `${cor}20`, border: `1px solid ${cor}40` }}>
                 <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" />
               </button>
               {pagina.musica_dados.capa && (
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={pagina.musica_dados.capa} alt="" className="w-full h-full object-cover" />
                 </div>
               )}
               <div className="min-w-0">
                 <p className="text-sm text-white truncate">{pagina.musica_dados.nome}</p>
                 <p className="text-xs text-white/40 truncate">{pagina.musica_dados.artista}</p>
               </div>
             </div>
           </Secao>
         )}
       </Secao>
     </section>
   )}

   {/* ===== FOTOS ===== */}
   {fotosNormalizadas.length > 0 && (
     <section className="min-h-[80dvh] flex items-center justify-center px-6 py-20">
       <Secao className="w-full max-w-4xl">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12 text-center" style={{ color: cor }}>Nossos momentos</p>
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
           {fotosNormalizadas.slice(0, 6).map((foto, i) => (
             <motion.button key={i} onClick={() => { setStoryInicial(i); setStoriesAberto(true) }}
               initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
               transition={{ delay: i * 0.1, duration: 0.6 }}
               className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden group">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={foto.url} alt={foto.legenda || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
               {foto.legenda && (
                 <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/60 to-transparent">
                   <p className="text-[10px] sm:text-xs text-white/80 truncate">{foto.legenda}</p>
                 </div>
               )}
             </motion.button>
           ))}
         </div>
         {fotosNormalizadas.length > 6 && (
           <button onClick={() => { setStoryInicial(0); setStoriesAberto(true) }}
             className="mt-6 mx-auto flex items-center gap-2 text-sm" style={{ color: cor }}>
             <Images className="w-4 h-4" /> Ver todas as {fotosNormalizadas.length} fotos
           </button>
         )}
       </Secao>
     </section>
   )}

   {storiesAberto && <StoriesViewer fotos={fotosNormalizadas} startIndex={storyInicial} onClose={() => setStoriesAberto(false)} cor={cor} />}

   {/* ===== COMO SE CONHECERAM ===== */}
   {pagina.dados_casal?.comoSeConheceram && (
     <section className="min-h-[80dvh] flex items-center justify-center px-6 py-20">
       <Secao className="text-center max-w-2xl">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12" style={{ color: cor }}>Como tudo comecou</p>
         <p className="text-xl sm:text-2xl md:text-3xl leading-relaxed italic text-white/80 break-words">
           &ldquo;{pagina.dados_casal.comoSeConheceram}&rdquo;
         </p>
         <div className="w-12 h-px mx-auto mt-8 sm:mt-12" style={{ background: cor }} />
       </Secao>
     </section>
   )}

   {/* ===== TAGS ===== */}
   {pagina.dados_casal && (pagina.dados_casal.cidadePrimeiroEncontro || pagina.dados_casal.comeFavorita || pagina.dados_casal.filmeFavorito) && (
     <section className="py-16 sm:py-20 px-6">
       <Secao className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
         {[
           pagina.dados_casal.cidadePrimeiroEncontro && { icon: <MapPinIcon className="w-3.5 h-3.5" style={{ color: cor }} />, text: pagina.dados_casal.cidadePrimeiroEncontro },
           pagina.dados_casal.comeFavorita && { icon: <Utensils className="w-3.5 h-3.5" style={{ color: cor }} />, text: pagina.dados_casal.comeFavorita },
           pagina.dados_casal.filmeFavorito && { icon: <Film className="w-3.5 h-3.5" style={{ color: cor }} />, text: pagina.dados_casal.filmeFavorito },
         ].filter(Boolean).map((item: any, i) => (
           <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
             transition={{ delay: i * 0.1 }} className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
             {item.icon}
             <span className="text-sm text-white/80">{item.text}</span>
           </motion.div>
         ))}
       </Secao>
     </section>
   )}

   {/* ===== MAPA ===== */}
   {pagina.locais && pagina.locais.length > 0 && (
     <section className="py-16 sm:py-20 px-6">
       <Secao className="max-w-3xl mx-auto">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12 text-center" style={{ color: cor }}>Mapa do amor</p>
         <div className="rounded-2xl overflow-hidden" style={{ height: 400 }}>
           <MapaAmor locais={pagina.locais} cor={cor} />
         </div>
       </Secao>
     </section>
   )}

   {/* ===== TIMELINE ===== */}
   {pagina.linha_do_tempo && pagina.linha_do_tempo.length > 0 && (
     <section className="py-16 sm:py-24 px-6">
       <Secao className="max-w-2xl mx-auto">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-12 sm:mb-16 text-center" style={{ color: cor }}>Nossa timeline</p>
         <div className="space-y-16 sm:space-y-24">
           {pagina.linha_do_tempo.map((ev, i) => (
             <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, delay: 0.1 }} className="text-center">
               <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6" style={{ color: `${cor}aa` }}>
                 {ev.data && new Date(ev.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
               </p>
               {ev.fotoUrl && (
                 <div className="rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 aspect-video">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={ev.fotoUrl} alt={ev.titulo} className="w-full h-full object-cover" />
                 </div>
               )}
               <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mb-3 break-words">{ev.titulo}</h3>
               {ev.descricao && <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-lg mx-auto break-words">{ev.descricao}</p>}
               {i < pagina.linha_do_tempo.length - 1 && (
                 <div className="w-px h-12 sm:h-16 mx-auto mt-10 sm:mt-14" style={{ background: `${cor}30` }} />
               )}
             </motion.div>
           ))}
         </div>
       </Secao>
     </section>
   )}

   {/* ===== MENSAGEM ===== */}
   <section className="min-h-[80dvh] flex items-center justify-center px-6 py-20">
     <Secao className="text-center max-w-2xl">
       <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12" style={{ color: cor }}>Uma mensagem do coracao</p>
       <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-white/85 whitespace-pre-wrap break-words">{pagina.mensagem}</p>
       <div className="w-12 h-px mx-auto mt-8 sm:mt-12" style={{ background: cor }} />
     </Secao>
   </section>

   {/* ===== BUCKET LIST ===== */}
   {pagina.bucket_list && (pagina.bucket_list as any[]).length > 0 && (
     <section className="py-16 sm:py-20 px-6">
       <Secao className="max-w-lg mx-auto">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12 text-center" style={{ color: cor }}>Nossos sonhos juntos</p>
         <div className="space-y-3">
           {(pagina.bucket_list as any[]).map((item: any, i: number) => (
             <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
               transition={{ delay: i * 0.05 }} className="flex items-center gap-3 py-3">
               <div className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                 style={{ borderColor: item.feito ? cor : 'rgba(255,255,255,0.15)', background: item.feito ? cor : 'transparent' }}>
                 {item.feito && <span className="text-xs text-white">&#10003;</span>}
               </div>
               <span className={`text-sm sm:text-base ${item.feito ? 'line-through text-white/40' : 'text-white/80'}`}>{item.texto}</span>
             </motion.div>
           ))}
         </div>
       </Secao>
     </section>
   )}

   {/* ===== AUDIO CAPSULE ===== */}
   {pagina.audio_mensagem && (
     <section className="min-h-[60dvh] flex items-center justify-center px-6 py-16">
       <Secao className="max-w-xl mx-auto w-full">
         <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12 text-center" style={{ color: cor }}>Capsula de voz</p>
         <CapsulaAudio audioUrl={pagina.audio_mensagem} mensagem={pagina.mensagem} cor={cor} musicRef={audioRef} />
       </Secao>
     </section>
   )}

   {/* ===== GUESTBOOK ===== */}
   <section className="py-16 sm:py-20 px-6">
     <Secao className="max-w-lg mx-auto">
       <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8 sm:mb-12 text-center" style={{ color: cor }}>Deixe sua mensagem</p>
       <div className="space-y-3 mb-10">
         <input value={guestNome} onChange={e => setGuestNome(e.target.value)} placeholder="Seu nome"
           className="w-full bg-transparent border-b border-white/10 px-2 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition" />
         <textarea value={guestMsg} onChange={e => setGuestMsg(e.target.value)} placeholder="Sua mensagem..." rows={3}
           className="w-full bg-transparent border-b border-white/10 px-2 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition resize-none" />
         <button onClick={enviarGuestbook} disabled={guestEnviando || !guestNome.trim() || !guestMsg.trim()}
           className="w-full py-3 rounded-full text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-30" style={{ background: cor }}>
           {guestEnviando ? 'Enviando...' : 'Enviar'}
         </button>
         {guestSucesso && <p className="text-xs text-center text-green-400">Mensagem enviada!</p>}
         {guestPendente && <p className="text-xs text-center text-amber-400">Aguardando aprovacao.</p>}
         {guestErro && <p className="text-xs text-center text-red-400">{guestErro}</p>}
       </div>
       {guestMsgs.length > 0 && (
         <div className="space-y-6">
           {guestMsgs.filter(m => m.aprovado !== false || ehDono).map(msg => (
             <motion.div key={msg.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
               className="py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <div className="flex items-center gap-2 mb-2">
                 <p className="text-sm font-bold text-white">{msg.nome}</p>
                 <p className="text-[10px] text-white/25">{new Date(msg.created_at).toLocaleDateString('pt-BR')}</p>
                 {msg.aprovado === false && <span className="text-[9px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Pendente</span>}
               </div>
               <p className="text-sm text-white/60 leading-relaxed">{msg.mensagem}</p>
               {ehDono && msg.aprovado === false && (
                 <button onClick={() => aprovarMsg(msg.id)} className="text-[10px] mt-2 px-3 py-1 rounded-full" style={{ background: `${cor}20`, color: cor }}>Aprovar</button>
               )}
             </motion.div>
           ))}
         </div>
       )}
     </Secao>
   </section>

   {/* ===== FOOTER ===== */}
   <section className="py-20 sm:py-28 text-center px-6">
     <Secao className="max-w-md mx-auto">
       <div className="w-8 h-px mx-auto mb-8" style={{ background: cor }} />
       <p className="text-xl sm:text-2xl font-black tracking-tight mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>A historia continua...</p>
       <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.08)' }}>eternizar</p>
     </Secao>
   </section>
 </div>
 )
}