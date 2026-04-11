'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Heart, Calendar, ArrowDown, Play, Pause, Volume2, Images, MessageCircle, Send } from 'lucide-react'
import StoriesViewer from '@/components/StoriesViewer'
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
  fotos: Foto[] | string[]
  linha_do_tempo: Evento[]
  senha_hash?: string
  senha_dica?: string
  dados_casal?: DadosCasal | null
  dados_formatura?: DadosFormatura | null
}

// Paletas de cor completas
const paletas: Record<string, { primaria: string; secundaria: string; brilho: string; fundo: string; fundoAlt: string; texto: string }> = {
  pink:    { primaria: '#ec4899', secundaria: '#f43f5e', brilho: '#fda4af', fundo: '#1a0010', fundoAlt: '#2d0018', texto: '#fce7f3' },
  violet:  { primaria: '#8b5cf6', secundaria: '#7c3aed', brilho: '#c4b5fd', fundo: '#0d0020', fundoAlt: '#1e1040', texto: '#ede9fe' },
  amber:   { primaria: '#f59e0b', secundaria: '#f97316', brilho: '#fcd34d', fundo: '#1a1000', fundoAlt: '#2d1800', texto: '#fef3c7' },
  blue:    { primaria: '#3b82f6', secundaria: '#06b6d4', brilho: '#93c5fd', fundo: '#000d1a', fundoAlt: '#001830', texto: '#dbeafe' },
  emerald: { primaria: '#10b981', secundaria: '#14b8a6', brilho: '#6ee7b7', fundo: '#001a0d', fundoAlt: '#002d18', texto: '#d1fae5' },
  rose:    { primaria: '#f43f5e', secundaria: '#ec4899', brilho: '#fda4af', fundo: '#1a0008', fundoAlt: '#2d0010', texto: '#ffe4e6' },
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

// Contador de tempo de namoro
function ContadorTempo({ dataInicio, cor, paleta }: { dataInicio: string; cor: string; paleta: typeof paletas[string] }) {
  const [tempo, setTempo] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 })

  useEffect(() => {
    function calcular() {
      const inicio = new Date(dataInicio)
      const agora = new Date()
      const diff = agora.getTime() - inicio.getTime()
      if (diff < 0) return

      const segundosTotal = Math.floor(diff / 1000)
      const minutosTotal = Math.floor(segundosTotal / 60)
      const horasTotal = Math.floor(minutosTotal / 60)
      const diasTotal = Math.floor(horasTotal / 24)

      const anos = Math.floor(diasTotal / 365)
      const meses = Math.floor((diasTotal % 365) / 30)
      const dias = diasTotal % 30
      const horas = horasTotal % 24
      const minutos = minutosTotal % 60
      const segundos = segundosTotal % 60

      setTempo({ anos, meses, dias, horas, minutos, segundos })
    }
    calcular()
    const interval = setInterval(calcular, 1000)
    return () => clearInterval(interval)
  }, [dataInicio])

  const itens = [
    { label: 'Anos', valor: tempo.anos },
    { label: 'Meses', valor: tempo.meses },
    { label: 'Dias', valor: tempo.dias },
    { label: 'Horas', valor: tempo.horas },
    { label: 'Minutos', valor: tempo.minutos },
    { label: 'Segundos', valor: tempo.segundos },
  ]

  return (
    <div className="max-w-sm mx-auto space-y-3">
      {/* Linha 1: Anos, Meses, Dias */}
      <div className="grid grid-cols-3 gap-3">
        {itens.slice(0, 3).map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center py-5 px-2 rounded-2xl backdrop-blur-sm"
            style={{
              background: `linear-gradient(135deg, ${cor}18, ${cor}08)`,
              border: `1px solid ${cor}25`,
              boxShadow: `0 8px 32px ${cor}10`
            }}
          >
            <motion.p
              key={item.valor}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl font-black leading-none tracking-tight"
              style={{ color: 'white' }}
            >
              {String(item.valor).padStart(2, '0')}
            </motion.p>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">{item.label}</p>
          </motion.div>
        ))}
      </div>
      {/* Linha 2: Horas, Minutos, Segundos */}
      <div className="grid grid-cols-3 gap-3">
        {itens.slice(3).map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center py-4 px-2 rounded-2xl backdrop-blur-sm"
            style={{
              background: item.label === 'Segundos'
                ? `linear-gradient(135deg, ${cor}30, ${cor}15)`
                : `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
              border: item.label === 'Segundos' ? `1px solid ${cor}50` : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <motion.p
              key={item.valor}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-3xl font-black leading-none tracking-tight"
              style={{ color: item.label === 'Segundos' ? cor : 'white' }}
            >
              {String(item.valor).padStart(2, '0')}
            </motion.p>
            <p className="text-xs text-gray-500 mt-1.5 uppercase tracking-widest">{item.label}</p>
          </motion.div>
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

// Player de música — preview de áudio + card estilo Spotify
function PlayerMusica({ dados, cor }: { dados: MusicaDados; cor: string }) {
  const [tocando, setTocando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!dados.previewUrl) return
    const audio = new Audio(dados.previewUrl)
    audio.volume = 0.5
    audioRef.current = audio
    audio.loop = true
    audio.ontimeupdate = () => setProgresso((audio.currentTime / audio.duration) * 100 || 0)

    const t = setTimeout(() => {
      audio.play().then(() => setTocando(true)).catch(() => {})
    }, 1500)

    return () => { clearTimeout(t); audio.pause(); audio.src = '' }
  }, [dados.previewUrl])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (tocando) { audio.pause(); setTocando(false) }
    else { audio.play(); setTocando(true) }
  }

  function handleBarra(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration
  }

  const youtubeUrl = `https://music.youtube.com/search?q=${encodeURIComponent(`${dados.nome} ${dados.artista}`)}`

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto border border-white/8" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>
      {/* Capa do álbum */}
      <div className="relative aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img src={dados.capa} alt={dados.album} className="w-full h-full object-cover"
          animate={{ scale: tocando ? 1.05 : 1 }} transition={{ duration: 0.8 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        {/* Ondas quando tocando */}
        {tocando && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div key={i} className="absolute rounded-full"
                style={{ border: `2px solid ${cor}40` }}
                animate={{ scale: [1, 2 + i * 0.5], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} />
            ))}
          </div>
        )}
      </div>

      {/* Info + controles */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-xl truncate">{dados.nome}</h3>
            <p className="text-gray-400 text-sm truncate mt-0.5">{dados.artista}</p>
            <p className="text-gray-600 text-xs truncate">{dados.album}</p>
          </div>
          <motion.div animate={{ scale: tocando ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.6, repeat: tocando ? Infinity : 0, repeatDelay: 0.4 }}>
            <Heart className="w-6 h-6 fill-current ml-3 mt-1" style={{ color: cor }} />
          </motion.div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-5 mb-1">
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer" onClick={handleBarra}>
            <motion.div className="h-full rounded-full" style={{ width: `${progresso}%`, backgroundColor: cor }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1.5">
            <span>Preview</span>
            <span>0:30</span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between mt-4">
          <Volume2 className="w-4 h-4 text-gray-600" />
          <div className="flex items-center gap-6">
            <button className="text-gray-500" onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; setProgresso(0) } }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
            </button>
            <motion.button onClick={togglePlay} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: cor }}>
              {tocando ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
            </motion.button>
            <button className="text-gray-500">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M6 18l8.5-6L6 6v12zm2-8.14 4.5 3.14L8 16.14V9.86zM16 6h2v12h-2z" /></svg>
            </button>
          </div>
          <div className="w-4" />
        </div>

        {/* Botão música completa */}
        <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mt-5 py-3 rounded-xl text-sm font-semibold text-white transition"
          style={{ background: cor }}>
          🎵 Ouvir a música completa ↗
        </a>
        <p className="text-center text-xs text-gray-600 mt-2">Preview de 30s · Abre no YouTube Music</p>
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
        <ParallaxLayer speed={0.12} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt={legenda || `Memória ${index + 1}`}
            className="w-full h-full object-cover" style={{ transform: 'scale(1.15)' }} />
        </ParallaxLayer>
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

export default function PaginaCliente({ pagina }: { pagina: Pagina }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const [senhaInput, setSenhaInput] = useState('')
  const [liberada, setLiberada] = useState(!pagina.senha_hash)
  const [erroSenha, setErroSenha] = useState(false)
  const [storiesAberto, setStoriesAberto] = useState(false)
  const [storyInicial, setStoryInicial] = useState(0)

  // Guestbook
  const [guestMsgs, setGuestMsgs] = useState<{id: string; nome: string; mensagem: string; created_at: string}[]>([])
  const [guestNome, setGuestNome] = useState('')
  const [guestMsg, setGuestMsg] = useState('')
  const [guestEnviando, setGuestEnviando] = useState(false)
  const [guestSucesso, setGuestSucesso] = useState(false)
  const [guestErro, setGuestErro] = useState('')

  // Carregar mensagens do guestbook
  useEffect(() => {
    fetch(`/api/guestbook?slug=${encodeURIComponent(pagina.slug)}`)
      .then(r => r.json())
      .then(d => { if (d.mensagens) setGuestMsgs(d.mensagens) })
      .catch(() => {})
  }, [pagina.slug])

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
        setGuestMsgs(prev => [data.mensagem, ...prev])
        setGuestNome('')
        setGuestMsg('')
        setGuestSucesso(true)
        setTimeout(() => setGuestSucesso(false), 3000)
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

  const tipo = pagina.tipo
  const emoji = tipo === 'casal' ? '❤️' : tipo === 'formatura' ? '🎓' : tipo === 'homenagem' ? '⭐' : '💌'

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
        style={{ background: `radial-gradient(ellipse at center, ${paleta.fundoAlt}, #08080c)` }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm w-full">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-6xl mb-6"
          >🔐</motion.div>
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
              🤔 Hmm, não foi dessa vez. Tente novamente!
            </motion.p>
          )}
          <button
            onClick={verificarSenha}
            className="w-full py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${cor}, ${paleta.secundaria})` }}
          >
            Abrir surpresa ✨
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="text-white overflow-x-hidden relative"
      style={{ background: '#08080c' }}>

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
            animate={{ y: [-20, 20, -20], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}
      </div>
      {/* ===== SLIDE 1 — ABERTURA HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Foto de capa como fundo com parallax */}
        {fotoCapa && (
          <ParallaxLayer speed={0.15} className="absolute inset-0 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotoCapa} alt="" className="w-full h-full object-cover scale-110 opacity-40" />
          </ParallaxLayer>
        )}

        {/* Gradiente overlay sobre a foto */}
        <div className="absolute inset-0 z-[1]" style={{
          background: fotoCapa
            ? `linear-gradient(to bottom, ${paleta.fundoAlt}99 0%, ${paleta.fundo}dd 50%, #08080c 100%)`
            : `radial-gradient(ellipse at 50% 30%, ${paleta.fundoAlt}, #08080c)`
        }} />

        {/* Glow orbs animados */}
        <div className="absolute inset-0 pointer-events-none z-[2]">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: cor }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ background: paleta.secundaria }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 6, repeat: Infinity, delay: 2 }}
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
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-16 h-16 fill-current drop-shadow-lg" style={{ color: cor, filter: `drop-shadow(0 0 30px ${cor}60)` }} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <p className="text-xs uppercase tracking-[0.25em] mb-6 font-medium" style={{ color: cor }}>
              Uma surpresa especial para você
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-[1.05] nome-capitalize px-2"
              style={{ textShadow: fotoCapa ? "0 4px 40px rgba(0,0,0,0.8)" : "none" }}>
              {pagina.titulo}
            </h1>
            {pagina.subtitulo && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-lg md:text-xl text-gray-300 mt-6 nome-capitalize"
                style={{ textShadow: fotoCapa ? "0 2px 20px rgba(0,0,0,0.6)" : "none" }}
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
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ArrowDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== SLIDE 2 — CONTADOR (apenas casal) ===== */}
      {pagina.tipo === 'casal' && pagina.dados_casal?.dataInicio && (
        <section className="py-16 sm:py-24 px-4" style={{ background: `linear-gradient(180deg, #08080c, ${paleta.fundo}, #08080c)` }}>
          <Secao className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium" style={{ color: cor }}>Juntos há exatamente</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-2">Contando cada segundo</h2>
            <p className="text-gray-500 text-sm">Desde {new Date(pagina.dados_casal.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </Secao>
          <Secao delay={0.2}>
            <ContadorTempo dataInicio={pagina.dados_casal.dataInicio} cor={cor} paleta={paleta} />
          </Secao>

          {/* Cards de dados do casal */}
          {(pagina.dados_casal.cidadePrimeiroEncontro || pagina.dados_casal.comeFavorita || pagina.dados_casal.filmeFavorito) && (
            <Secao delay={0.3} className="mt-12 max-w-sm mx-auto">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { emoji: '📍', label: 'Onde tudo começou', valor: pagina.dados_casal.cidadePrimeiroEncontro },
                  { emoji: '🍕', label: 'Comida favorita', valor: pagina.dados_casal.comeFavorita },
                  { emoji: '🎬', label: 'Filme favorito', valor: pagina.dados_casal.filmeFavorito },
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
        <section className="py-24 px-4" style={{ background: `linear-gradient(180deg, #08080c, ${paleta.fundo}, #08080c)` }}>
          <Secao className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium" style={{ color: cor }}>Uma conquista coletiva</p>
            <h2 className="text-3xl sm:text-4xl font-black">{pagina.dados_formatura.curso}</h2>
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
                  <p className="text-3xl font-black" style={{ color: cor }}>{pagina.dados_formatura.casaisFormados} 💑</p>
                  <p className="text-xs text-gray-500 mt-1">Casais formados</p>
                </div>
              )}
            </div>
          </Secao>
        </section>
      )}

      {/* ===== SLIDE 3 — FOTOS ESTILO STORIES ===== */}
      {fotosNormalizadas.length > 0 && (
        <section className="py-24 px-4">
          <Secao className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium" style={{ color: cor }}>Memórias que ficam</p>
            <h2 className="text-3xl sm:text-4xl font-black">Nossos momentos</h2>
            <p className="text-gray-500 text-sm mt-2">Toque nas fotos para ver como stories</p>
          </Secao>

          {/* Miniaturas estilo stories */}
          <div className="flex gap-4 justify-center flex-wrap max-w-2xl mx-auto">
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
                className="relative flex flex-col items-center gap-2 group"
              >
                {/* Anel colorido estilo story não visto */}
                <div className="p-0.5 rounded-full" style={{ background: `linear-gradient(135deg, ${cor}, ${paleta.secundaria})` }}>
                  <div className="p-0.5 rounded-full bg-[#08080c]">
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

      {/* ===== LINHA DO TEMPO ===== */}
      {pagina.linha_do_tempo?.length > 0 && (
        <section className="py-16 sm:py-24 overflow-hidden" style={{ background: `linear-gradient(180deg, #08080c, ${paleta.fundo} 50%, #08080c)` }}>
          <Secao className="text-center mb-20 px-4">
            <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium" style={{ color: cor }}>Nossa história</p>
            <h2 className="text-3xl sm:text-4xl font-black">Linha do tempo</h2>
          </Secao>

          <div className="max-w-2xl mx-auto px-4 sm:px-6 relative">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute left-7 top-0 bottom-0 w-0.5 origin-top"
              style={{ background: `linear-gradient(to bottom, transparent, ${cor}80 10%, ${cor}80 90%, transparent)` }}
            />

            <div className="space-y-0">
              {pagina.linha_do_tempo.map((ev, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="flex gap-4 sm:gap-6 pl-16 sm:pl-20 relative pb-14 sm:pb-20 last:pb-0"
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
                    className="absolute left-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden text-2xl shrink-0"
                    style={{ background: `linear-gradient(135deg, ${cor}, ${paleta.secundaria})`, boxShadow: `0 8px 40px ${cor}50` }}
                  >
                    <EmojiAnimado emoji={ev.emoji || '⭐'} tamanho={36} />
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

      {/* ===== SLIDE 4 — PLAYER DE MÚSICA ===== */}
      {(pagina.musica_dados || pagina.musica_nome) && (
        <section className="py-20 sm:py-32 px-4" style={{ background: `linear-gradient(180deg, #08080c 0%, ${paleta.fundo} 50%, #08080c 100%)` }}>
          <Secao className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium" style={{ color: cor }}>Nossa música</p>
            <h2 className="text-3xl sm:text-4xl font-black px-4 break-words">
              {pagina.musica_dados ? pagina.musica_dados.nome : pagina.musica_nome}
            </h2>
          </Secao>

          {pagina.musica_dados ? (
            <Secao delay={0.2}>
              <PlayerMusica dados={pagina.musica_dados} cor={cor} />
            </Secao>
          ) : (
            // Fallback se não tiver dados completos
            <Secao className="text-center">
              <p className="text-gray-400">{pagina.musica_nome}</p>
            </Secao>
          )}
        </section>
      )}

      {/* ===== SLIDE 5 — MENSAGEM FINAL ===== */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{ background: `radial-gradient(ellipse at center bottom, ${paleta.fundoAlt}, #08080c)` }}>

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
              animate={{ y: [-20, 20, -20], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>

        <Secao className="text-center max-w-2xl mx-auto relative z-10">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-10"
          >
            💌
          </motion.div>

          {/* Aspas decorativas */}
          <div className="text-5xl sm:text-7xl md:text-8xl font-serif leading-none mb-4 sm:mb-6 select-none" style={{ color: `${cor}20` }}>"</div>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed font-light mb-6 sm:mb-8 px-2 sm:px-8 break-words">
            {pagina.mensagem}
          </p>

          <div className="text-5xl sm:text-7xl md:text-8xl font-serif leading-none mb-6 sm:mb-8 select-none text-right" style={{ color: `${cor}20` }}>"</div>

          {/* Coração pulsante */}
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            <Heart className="w-10 h-10 mx-auto fill-current" style={{ color: cor }} />
          </motion.div>
        </Secao>
      </section>

      {/* ===== ENCERRAMENTO ===== */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ background: cor, left: `${20 + i * 20}%`, top: `${30 + (i % 2) * 30}%` }}
              animate={{ opacity: [0, 0.6, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 1.2 }}
            />
          ))}
        </div>
        <Secao className="text-center max-w-xl mx-auto relative z-10">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mb-6"
          >
            <Heart className="w-8 h-8 mx-auto" style={{ color: `${cor}50` }} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-200">
            Este não é o fim.
          </h2>
          <p className="text-gray-500 leading-relaxed text-base">
            É apenas mais um capítulo de uma história que continua sendo escrita a cada dia.
          </p>
          <div className="mt-8 w-16 h-px mx-auto" style={{ background: `linear-gradient(to right, transparent, ${cor}60, transparent)` }} />
        </Secao>
      </section>

      {/* ===== LIVRO DE VISITAS ===== */}
      <section className="py-24 px-4" style={{ background: `linear-gradient(180deg, #08080c, ${paleta.fundo}, #08080c)` }}>
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
            <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-green-400 text-sm mt-3 text-center">
                  Mensagem enviada com carinho! 💖
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
                  className="rounded-2xl p-5 backdrop-blur-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Rodapé */}
      <div className="py-8 text-center border-t border-white/5">
        <a href="/" className="inline-flex items-center justify-center gap-2 text-xs text-gray-700 hover:text-gray-500 transition">
          Criado com <img src="/logo.png" alt="Eternizar" className="h-7 inline-block opacity-80" />
        </a>
      </div>
    </div>
  )
}
