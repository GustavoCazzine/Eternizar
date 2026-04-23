'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Heart, Calendar, ArrowDown, Play, Pause, Volume2, Images, MessageCircle, Send } from 'lucide-react'
import StoriesViewer from '@/components/StoriesViewer'
import MapaAmor from '@/components/MapaAmor'
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
 pink: { primaria: '#9B1B30', secundaria: '#B91C3C', brilho: '#e8a0b0', fundo: '#12000a', fundoAlt: '#1e0012', texto: '#f5e0e8' },
 violet: { primaria: '#8b5cf6', secundaria: '#7c3aed', brilho: '#c4b5fd', fundo: '#0d0020', fundoAlt: '#1e1040', texto: '#ede9fe' },
 amber: { primaria: '#f59e0b', secundaria: '#f97316', brilho: '#fcd34d', fundo: '#1a1000', fundoAlt: '#2d1800', texto: '#fef3c7' },
 blue: { primaria: '#3b82f6', secundaria: '#06b6d4', brilho: '#93c5fd', fundo: '#000d1a', fundoAlt: '#001830', texto: '#dbeafe' },
 emerald: { primaria: '#10b981', secundaria: '#14b8a6', brilho: '#6ee7b7', fundo: '#001a0d', fundoAlt: '#002d18', texto: '#d1fae5' },
 rose: { primaria: '#C2185B', secundaria: '#9B1B30', brilho: '#fda4af', fundo: '#1a0008', fundoAlt: '#2d0010', texto: '#ffe4e6' },
}

const paresFonte: Record<string, { titulo: string; corpo: string }> = {
 classico: { titulo: 'var(--font-cormorant)', corpo: 'var(--font-outfit)' },
 moderno: { titulo: 'var(--font-space)', corpo: 'var(--font-inter)' },
 romantico: { titulo: 'var(--font-playfair)', corpo: 'var(--font-outfit)' },
 divertido: { titulo: 'var(--font-caveat)', corpo: 'var(--font-inter)' },
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
 <div className="w-16 h-12 relative">
 <div className="absolute inset-0 rounded-lg" style={{ background: `${cor}20`, border: `2px solid ${cor}40` }} />
 <div className="absolute top-0 left-0 right-0 h-6" style={{ background: `${cor}15`, clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }} />
 </div>
 <p className="text-sm font-medium" style={{ color: cor }}>Toque para abrir a carta</p>
 </motion.button>
 )
 }

 return (
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
 className="max-w-lg mx-auto rounded-3xl p-8 border" style={{ background: `${cor}08`, borderColor: `${cor}20` }}>
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
        <p className="text-lg text-white/60 mb-6 italic" style={{ fontFamily: fontes.titulo }}>
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
      <p className="text-xl leading-relaxed whitespace-pre-wrap" style={{ fontFamily: fontes.corpo, color: 'rgba(255,255,255,0.85)' }}>
        {texto}
        {texto.length < mensagem.length && <span className="inline-block w-0.5 h-6 ml-0.5 animate-pulse" style={{ background: cor }} />}
      </p>
    </div>
  )
}

export default function PaginaCliente({ pagina }: { pagina: Pagina }) {
 const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
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
 const fontes = paresFonte[pagina.fonte_par || 'classico'] || paresFonte.classico

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
 style={{ background: `radial-gradient(ellipse at center, ${paleta.fundoAlt}, #121212)` }}>
 <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm w-full">
 <motion.div
 animate={{ rotate: [0, -10, 10, -10, 0] }}
 transition={{ duration: 1, delay: 0.5 }}
 className="text-6xl mb-6"
 >•</motion.div>
 <h1 className="text-2xl font-bold mb-2">Surpresa especial te esperando!</h1>
 <p className="text-gray-400 mb-2">Alguém criou algo lindo para você.</p>
 <p className="text-gray-500 text-sm mb-6">Para abrir, responda: o que só vocês dois sabem?</p>
 {pagina.senha_dica && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.3 }}
 className="mb-6 p-4 rounded-2xl border bg-white/5"
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
 className="w-full py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
 style={{ background: `linear-gradient(135deg, ${cor}, ${paleta.secundaria})` }}
 >
 Abrir surpresa
 </button>
 </motion.div>
 </div>
 )
 }

 return (
 <div ref={containerRef} className="text-white overflow-x-hidden relative"
 style={{ background: '#121212', fontFamily: fontes.corpo }}>

 {/* Barra de progresso */}
 <div className="fixed top-0 left-0 right-0 h-0.5 z-50" style={{ background: 'rgba(255,255,255,0.05)' }}>
 <motion.div style={{ width: progressWidth, backgroundColor: cor }} className="h-full" />
 </div>


 {/* Partículas decorativas globais */}
 <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
 {[...Array(5)].map((_, i) => (
 <motion.div key={`particle-${i}`} className="absolute rounded-full"
 style={{ width: 3 + (i % 3) * 2, height: 3 + (i % 3) * 2, background: `${cor}${20 + i * 8}`,
 left: `${10 + i * 18}%`, top: `${25 + ((i * 23) % 50)}%` }}
 
 
 />
 ))}
 </div>
 {/* ===== SLIDE 1 — ABERTURA HERO ===== */}
 <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

 {/* Foto de capa como fundo com parallax */}
 {fotoCapa && (
 <div className="absolute inset-0 pointer-events-none" style={{ backgroundAttachment: "fixed" }}>
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={fotoCapa} alt="" className="w-full h-full object-cover scale-110 opacity-60" style={{ objectPosition: "center 30%" }} />
 </div>
 )}

 {/* Gradiente overlay sobre a foto */}
 <div className="absolute inset-0 z-[1]" style={{
 background: fotoCapa
 ? `linear-gradient(to bottom, transparent 0%, ${paleta.fundo}40 30%, ${paleta.fundo}bb 60%, #121212 100%)`
 : `radial-gradient(ellipse at 50% 30%, ${paleta.fundoAlt}, #121212)`
 }} />

 {/* Glow orbs animados */}
 <div className="absolute inset-0 pointer-events-none z-[2]">
 <motion.div
 className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full blur-2xl opacity-20"
 style={{ background: cor }}
 
 
 />
 <motion.div
 className="absolute bottom-1/3 right-1/4 w-32 h-32 rounded-full blur-2xl opacity-10"
 style={{ background: paleta.secundaria }}
 
 
 />
 </div>

 {/* Conteúdo principal */}
 <div className="relative z-10 text-center px-6 max-w-3xl">
 {/* Ícone SVG animado em vez de emoji */}
 <motion.div
 initial={{ scale: 0, y: 20 }}
 animate={{ scale: 1, y: 0 }}
 transition={{ type: "spring", duration: 1, bounce: 0.3 }}
 className="mb-8 inline-flex items-center justify-center"
 >
 <motion.div
 
 
 >
 <Heart className="w-16 h-16 fill-current drop-shadow-lg" style={{ color: cor, filter: `drop-shadow(0 0 30px ${cor}60)` }} />
 </motion.div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 40 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4, duration: 0.8 }}
 >
 <p className="text-xs uppercase tracking-[0.25em] mb-6 font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                Uma surpresa especial para você
 </p>
 <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-[1.05] nome-capitalize px-2"
 style={{ textShadow: fotoCapa ? "0 4px 40px rgba(0,0,0,0.8)" : "none", fontFamily: fontes.titulo }}>
 {pagina.titulo}
 </h1>
 {pagina.subtitulo && (
 <motion.p
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.8 }}
 className="text-lg md:text-xl mt-6 nome-capitalize"
                style={{ color: "rgba(255,255,255,0.65)", textShadow: fotoCapa ? "0 2px 20px rgba(0,0,0,0.6)" : "none" }}
 >
 {pagina.subtitulo}
 </motion.p>
 )}
 </motion.div>
 </div>

 {/* Scroll indicator */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 1.5 }}
 className="absolute bottom-10 flex flex-col items-center gap-2 z-10"
 style={{ color: `${cor}80` }}
 >
 <span className="text-xs uppercase tracking-widest">Role para descobrir</span>
 <motion.div >
 <ArrowDown className="w-5 h-5" />
 </motion.div>
 </motion.div>
 </section>

 {/* ===== SLIDE 2 — CONTADOR (apenas casal) ===== */}
 {pagina.tipo === 'casal' && pagina.dados_casal?.dataInicio && (
 <section className="py-16 sm:py-24 px-4" style={{ background: `linear-gradient(180deg, #121212, ${paleta.fundo}, #121212)` }}>
 <Secao className="text-center mb-10">
 <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium" style={{ color: cor }}>Juntos há exatamente</p>
 <h2 className="text-3xl sm:text-4xl font-black mb-2">Contando cada segundo</h2>
 <p className="text-gray-500 text-sm">Desde {new Date(pagina.dados_casal.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
 </Secao>
 <Secao delay={0.2}>
 <ContadorTempo dataInicio={pagina.dados_casal.dataInicio} cor={cor} paleta={paleta} />
 </Secao>
        {pagina.musica_dados && <Secao delay={0.3} className="mt-10"><PlayerMusica dados={pagina.musica_dados} cor={cor} /></Secao>}

 {/* Cards de dados do casal — below scroll area */}
 {(pagina.dados_casal.cidadePrimeiroEncontro || pagina.dados_casal.comeFavorita || pagina.dados_casal.filmeFavorito) && (
 <Secao delay={0.3} className="mt-16 max-w-sm mx-auto">
 <div className="grid grid-cols-1 gap-3">
 {[
 { emoji: '●', label: 'Onde tudo começou', valor: pagina.dados_casal.cidadePrimeiroEncontro },
 { emoji: '•', label: 'Comida favorita', valor: pagina.dados_casal.comeFavorita },
 { emoji: '•', label: 'Filme favorito', valor: pagina.dados_casal.filmeFavorito },
 ].filter(item => item.valor).map((item, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, x: -20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ delay: i * 0.1, duration: 0.6 }}
 className="flex items-center gap-4 p-4 rounded-2xl backdrop-blur-sm"
 style={{
 background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
 border: `1px solid rgba(255,255,255,0.1)`,
 }}
 >
 <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
 style={{ background: `${cor}20`, border: `1px solid ${cor}30` }}>
 {item.emoji}
 </div>
 <div>
 <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: `${cor}99` }}>{item.label}</p>
 <p className="font-semibold text-white">{item.valor}</p>
 </div>
 </motion.div>
 ))}
 </div>
 </Secao>
 )}
 </section>
 )}

 {/* ===== DADOS DE FORMATURA ===== */}
 {pagina.tipo === 'formatura' && pagina.dados_formatura?.curso && (
 <section className="py-24 px-4" style={{ background: `linear-gradient(180deg, #121212, ${paleta.fundo}, #121212)` }}>
 <Secao className="text-center mb-10">
 <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium" style={{ color: cor }}>Uma conquista coletiva</p>
 <h2 className="text-3xl sm:text-4xl font-black glint-effect">{pagina.dados_formatura.curso}</h2>
 {pagina.dados_formatura.instituicao && <p className="text-gray-400 mt-2">{pagina.dados_formatura.instituicao} · {pagina.dados_formatura.anoFormatura}</p>}
 </Secao>
 <Secao delay={0.2} className="max-w-sm mx-auto space-y-3">
 {pagina.dados_formatura.nomeTurma && (
 <div className="text-center p-4 rounded-2xl" style={{ background: `${cor}15`, border: `1px solid ${cor}30` }}>
 <p className="text-xs text-gray-500 mb-1">A turma</p>
 <p className="text-2xl font-black">{pagina.dados_formatura.nomeTurma}</p>
 </div>
 )}
 <div className="grid grid-cols-2 gap-3">
 {pagina.dados_formatura.quantidadeAlunos && (
 <div className="text-center p-4 rounded-2xl" style={{ background: `${cor}10`, border: `1px solid ${cor}20` }}>
 <p className="text-3xl font-black" style={{ color: cor }}>{pagina.dados_formatura.quantidadeAlunos}</p>
 <p className="text-xs text-gray-500 mt-1">Formandos</p>
 </div>
 )}
 {pagina.dados_formatura.casaisFormados && (
 <div className="text-center p-4 rounded-2xl" style={{ background: `${cor}10`, border: `1px solid ${cor}20` }}>
 <p className="text-3xl font-black" style={{ color: cor }}>{pagina.dados_formatura.casaisFormados}</p>
 <p className="text-xs text-gray-500 mt-1">Casais formados</p>
 </div>
 )}
 </div>
 </Secao>
 </section>
 )}

 {/* ===== STORIES ===== */}
        {fotosNormalizadas.length > 0 && (
          <section className="py-14 sm:py-20 px-4">
 <Secao className="text-center mb-10">
 <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Memórias que ficam</p>
 <h2 className="text-3xl sm:text-4xl font-black" style={{ fontFamily: fontes.titulo }}>Nossos momentos</h2>
 <p className="text-gray-500 text-sm mt-2">Toque nas fotos para ver como stories</p>
 </Secao>

 {/* Miniaturas estilo stories */}
 <div className="flex gap-5 overflow-x-auto scrollbar-hide px-6 pb-4 -mx-4 snap-x snap-mandatory">
 {fotosNormalizadas.map((foto, i) => (
 <motion.button
 key={i}
 initial={{ opacity: 0, scale: 0.8 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true }}
 transition={{ delay: i * 0.1 }}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.97 }}
 onClick={() => { setStoryInicial(i); setStoriesAberto(true) }}
 className="relative flex flex-col items-center gap-2 group snap-center shrink-0"
 >
 {/* Anel colorido estilo story não visto */}
 <div className="p-0.5 rounded-full" style={{ background: `linear-gradient(135deg, ${cor}, ${paleta.secundaria})` }}>
 <div className="p-0.5 rounded-full bg-[#121212]">
 <div className="w-20 h-20 rounded-full overflow-hidden">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={foto.url} alt={foto.legenda || `Foto ${i + 1}`}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
 </div>
 </div>
 </div>
 {/* Legenda curta */}
 <p className="text-xs text-gray-400 text-center max-w-[80px] truncate">
 {foto.legenda || `Foto ${i + 1}`}
 </p>
 </motion.button>
 ))}
 </div>

 {/* Botão ver todas */}
 <Secao className="text-center mt-8">
 <button
 onClick={() => { setStoryInicial(0); setStoriesAberto(true) }}
 className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl text-sm font-medium transition"
 style={{ background: `${cor}20`, color: cor, border: `1px solid ${cor}40` }}
 >
 <Images className="w-4 h-4" />
 Ver todas as memórias
 </button>
 </Secao>

 {/* Stories Viewer */}
 <StoriesViewer
 fotos={fotosNormalizadas}
 cor={cor}
 aberto={storiesAberto}
 indiceInicial={storyInicial}
 onFechar={() => setStoriesAberto(false)}
 />
 </section>
 )}

 {/* ===== COMO SE CONHECERAM ===== */}
 {pagina.tipo === 'casal' && pagina.dados_casal?.comoSeConheceram && (
 <section className="py-20 px-4">
 <Secao className="max-w-2xl mx-auto text-center">
 <p className="text-xs uppercase tracking-[0.25em] mb-4 font-medium" style={{ color: cor }}>A nossa história</p>
 <div className="text-6xl font-serif mb-4 select-none" style={{ color: `${cor}40` }}>“</div>
 <p className="text-base sm:text-xl text-gray-300 leading-relaxed italic break-words px-2">
 {pagina.dados_casal.comoSeConheceram}
 </p>
 <div className="text-6xl font-serif mt-2 text-right select-none" style={{ color: `${cor}40` }}>”</div>
 </Secao>
 </section>
 )}

 
        {/* ===== MAPA DO AMOR ===== */}
        {pagina.locais && pagina.locais.length > 0 && (
          <section className="py-20 px-4">
            <Secao className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black" style={{ fontFamily: fontes.titulo }}>Mapa do Amor</h2>
              <p className="text-gray-500 text-sm mt-2">Os lugares que fazem parte da nossa historia</p>
            </Secao>
            <Secao delay={0.2}>
              <MapaAmor locais={pagina.locais} cor={cor} />
            </Secao>
          </section>
        )}

{/* ===== LINHA DO TEMPO ===== */}
 {pagina.linha_do_tempo?.length > 0 && (
 <section className="py-16 sm:py-24 overflow-hidden" style={{ background: `linear-gradient(180deg, #121212, ${paleta.fundo} 50%, #121212)` }}>
 <Secao className="text-center mb-20 px-4">
 <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium" style={{ color: cor }}>Nossa história</p>
 <h2 className="text-3xl sm:text-4xl font-black" style={{ fontFamily: fontes.titulo }}>Linha do tempo</h2>
 </Secao>

 <div className="max-w-2xl mx-auto px-4 sm:px-6 relative">
 <div className="lg:left-1/2 lg:-translate-x-px"><TimelineLine cor={cor} /></div>

 <div className="space-y-0">
 {pagina.linha_do_tempo.map((ev, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, x: -60 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true, margin: '-60px' }}
 transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
 className={`relative pb-14 sm:pb-20 last:pb-0 flex gap-4 sm:gap-6 pl-16 sm:pl-20 lg:pl-0 ${i % 2 === 0 ? "lg:flex-row lg:pr-[calc(50%+2rem)] lg:pl-8 lg:text-right" : "lg:flex-row-reverse lg:pl-[calc(50%+2rem)] lg:pr-8"}`}
 >
 <motion.div
 initial={{ scaleX: 0 }}
 whileInView={{ scaleX: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay: 0.2 }}
 className="absolute left-6 sm:left-7 top-6 h-px w-8 sm:w-12 origin-left"
 style={{ background: `linear-gradient(to right, ${cor}80, transparent)` }}
 />

 <motion.div
 initial={{ scale: 0, rotate: -180 }}
 whileInView={{ scale: 1, rotate: 0 }}
 viewport={{ once: true }}
 transition={{ type: 'spring', duration: 0.8, bounce: 0.4, delay: 0.15 }}
 className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 left-0 ${i % 2 === 0 ? "lg:left-auto lg:right-[-1.5rem] lg:translate-x-1/2" : "lg:left-[-1.5rem] lg:-translate-x-1/2"}`}
 style={{ background: `linear-gradient(135deg, ${cor}, ${paleta.secundaria})`, boxShadow: `0 4px 20px ${cor}30` }}
 >
 <div className="w-3 h-3 rounded-full bg-white" />
 </motion.div>

 <div className="flex-1 pt-1">
 {ev.data && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: 0.25 }}
 className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs mb-3"
 style={{ background: `${cor}18`, border: `1px solid ${cor}30`, color: `${cor}cc` }}
 >
 <Calendar className="w-3 h-3" />
 {ev.data}
 </motion.div>
 )}

 <motion.h3
 initial={{ opacity: 0 }}
 whileInView={{ opacity: 1 }}
 viewport={{ once: true }}
 transition={{ delay: 0.3 }}
 className="text-xl sm:text-2xl font-black mb-3 leading-tight break-words"
 >
 {ev.titulo}
 </motion.h3>

 {ev.descricao && (
 <motion.p
 initial={{ opacity: 0, y: 10 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: 0.35 }}
 className="text-gray-400 leading-relaxed mb-5"
 >
 {ev.descricao}
 </motion.p>
 )}

 {ev.fotoUrl && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 whileInView={{ opacity: 1, scale: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
 className="rounded-2xl overflow-hidden shadow-2xl"
 style={{ boxShadow: `0 20px 60px ${cor}20` }}
 >
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={ev.fotoUrl} alt={ev.titulo} className="w-full object-cover max-h-72" />
 <div className="h-px" style={{ background: `linear-gradient(to right, ${cor}, transparent)` }} />
 </motion.div>
 )}

 {i < pagina.linha_do_tempo.length - 1 && !ev.fotoUrl && (
 <div className="mt-4 h-px w-24" style={{ background: `linear-gradient(to right, ${cor}30, transparent)` }} />
 )}
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </section>
 )}

 {/* Player moved to counter section */}

 {/* Player for non-casal */}
        {pagina.tipo !== 'casal' && pagina.musica_dados && (
          <section className="py-12 px-4" style={{ background: '#000' }}>
            <Secao><PlayerMusica dados={pagina.musica_dados} cor={cor} /></Secao>
          </section>
        )}

        {/* ===== SLIDE 5 — MENSAGEM FINAL ===== */}
 <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
 style={{ background: `radial-gradient(ellipse at center bottom, ${paleta.fundoAlt}, #121212)` }}>

 {/* Partículas de fundo */}
 <div className="absolute inset-0 pointer-events-none overflow-hidden">
 {[...Array(6)].map((_, i) => (
 <motion.div
 key={i}
 className="absolute rounded-full"
 style={{
 width: 4 + i * 3,
 height: 4 + i * 3,
 backgroundColor: `${cor}${30 + i * 10}`,
 left: `${15 + i * 13}%`,
 top: `${20 + (i % 3) * 25}%`,
 }}
 
 
 />
 ))}
 </div>

 <Secao className="text-center max-w-2xl mx-auto relative z-10">
 <motion.div
 
 
 className="text-6xl mb-10"
 >
 
 </motion.div>

 {/* Aspas decorativas */}
 <div className="text-5xl sm:text-7xl md:text-8xl font-serif leading-none mb-4 sm:mb-6 select-none" style={{ color: `${cor}20` }}>"</div>

 <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed font-light mb-6 sm:mb-8 px-2 sm:px-8 break-words">
 {pagina.tipo === 'casal' ? '' : pagina.mensagem}
 </p>
 {pagina.tipo === 'casal' && <CartaSelada mensagem={pagina.mensagem} cor={cor} fontCorpo={fontes.corpo} />}
 <div className="flex justify-center mt-8"><BotaoReacao cor={cor} /></div>

 <div className="text-5xl sm:text-7xl md:text-8xl font-serif leading-none mb-6 sm:mb-8 select-none text-right" style={{ color: `${cor}20` }}>"</div>

 {/* Coração pulsante */}
 <motion.div
 
 
 >
 <Heart className="w-10 h-10 mx-auto fill-current" style={{ color: cor }} />
 </motion.div>
 </Secao>
 </section>

 

 
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

{/* ===== LIVRO DE VISITAS ===== */}
 {pagina.compartilhavel !== false && (
 <section className="py-24 px-4" style={{ background: `linear-gradient(180deg, #121212, ${paleta.fundo}, #121212)` }}>
 <Secao className="text-center mb-12">
 <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium" style={{ color: cor }}>Deixe sua marca</p>
 <h2 className="text-3xl sm:text-4xl font-black flex items-center justify-center gap-3">
 <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: cor }} />
 Livro de Visitas
 </h2>
 <p className="text-gray-500 text-sm mt-2">Deixe uma mensagem carinhosa</p>
 </Secao>

 <div className="max-w-lg mx-auto">
 {/* Formulário */}
 <Secao delay={0.1}>
 <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
 <input
 type="text"
 value={guestNome}
 onChange={e => setGuestNome(e.target.value.slice(0, 50))}
 placeholder="Seu nome"
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none mb-3 transition nome-capitalize"
 style={{ borderColor: guestErro ? '#f43f5e' : undefined }}
 />
 <textarea
 value={guestMsg}
 onChange={e => setGuestMsg(e.target.value.slice(0, 300))}
 placeholder="Sua mensagem... (max 300 caracteres)"
 rows={3}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none mb-3 transition resize-none"
 />
 <div className="flex items-center justify-between">
 <span className="text-xs text-gray-600">{guestMsg.length}/300</span>
 <button
 onClick={enviarGuestbook}
 disabled={guestEnviando || !guestNome.trim() || !guestMsg.trim()}
 className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition disabled:opacity-40 hover:opacity-90"
 style={{ background: `linear-gradient(135deg, ${cor}, ${paleta.secundaria})` }}
 >
 <Send className="w-4 h-4" />
 {guestEnviando ? 'Enviando...' : 'Enviar'}
 </button>
 </div>
 {guestSucesso && (
 <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-400 text-sm mt-3 text-center">
 {guestPendente ? 'Mensagem enviada! Aguardando aprovação do criador' : 'Mensagem enviada com carinho!'}
 </motion.p>
 )}
 {guestErro && (
 <p className="text-red-400 text-sm mt-3 text-center">{guestErro}</p>
 )}
 </div>
 </Secao>

 {/* Lista de mensagens */}
 {guestMsgs.length > 0 && (
 <div className="space-y-4">
 {guestMsgs.map((msg, i) => (
 <motion.div
 key={msg.id}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: Math.min(i * 0.05, 0.3) }}
 className="rounded-2xl p-5 backdrop-blur-sm relative"
 style={{
 background: msg.aprovado === false ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.04)',
 border: msg.aprovado === false ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(255,255,255,0.08)',
 }}
 >
 {ehDono && msg.aprovado === false && (
 <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
 Pendente
 </span>
 )}
 <div className="flex items-center gap-3 mb-3">
 <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${cor}20`, color: cor }}>
 {msg.nome.charAt(0).toUpperCase()}
 </div>
 <div>
 <p className="text-white font-semibold text-sm nome-capitalize">{msg.nome}</p>
 <p className="text-gray-600 text-xs">
 {new Date(msg.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
 </p>
 </div>
 </div>
 <p className="text-gray-300 text-sm leading-relaxed break-words">{msg.mensagem}</p>

 {ehDono && (
 <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
 {msg.aprovado === false ? (
 <button onClick={() => aprovarMsg(msg.id, true)}
 className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition">
 Aprovar
 </button>
 ) : (
 <button onClick={() => aprovarMsg(msg.id, false)}
 className="flex-1 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition">
 Ocultar
 </button>
 )}
 <button onClick={() => deletarMsg(msg.id)}
 className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition">
 Excluir
 </button>
 </div>
 )}
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </section>
 )}

 {/* Rodapé */}
        <footer className="py-20 text-center border-t border-white/5">
          <p className="text-2xl sm:text-3xl font-light text-white/30 italic" style={{ fontFamily: fontes.titulo }}>
            A história continua...
          </p>
          <a href="/criar" className="inline-block mt-6 px-6 py-3 rounded-xl text-sm font-medium transition border border-white/10 hover:border-white/25 text-zinc-500 hover:text-white">
            Criar sua homenagem
          </a>
          <p className="text-xs text-zinc-700 mt-8">eternizar</p>
        </footer>
 </div>
 )
}
