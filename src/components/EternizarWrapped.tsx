'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Lock, Volume2 } from 'lucide-react'
import { UNIVERSE } from '@/lib/constants'

interface Props {
  titulo: string
  dataInicio?: string
  comidaFavorita?: string
  filmeFavorito?: string
  cidadeEncontro?: string
  musicaCapa?: string
  musicaNome?: string
  previewUrl?: string | null
  cor: string
  onDesbloquear: () => void
}

const BG_LOOP = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'


export default function EternizarWrapped({ titulo, dataInicio, comidaFavorita, filmeFavorito, cidadeEncontro, musicaCapa, musicaNome, previewUrl, cor, onDesbloquear }: Props) {
  const [started, setStarted] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const [removido, setRemovido] = useState(false)
  const [diasAnim, setDiasAnim] = useState(0)
  const bgRef = useRef<HTMLAudioElement | null>(null)
  const dropRef = useRef<HTMLAudioElement | null>(null)
  const [dropped, setDropped] = useState(false)
  const musicSectionRef = useRef<HTMLDivElement>(null)
  const [isMusicVisible, setIsMusicVisible] = useState(false)

  const totalDias = dataInicio ? Math.floor((Date.now() - new Date(dataInicio).getTime()) / 86400000) : 0
  const totalHoras = totalDias * 24
  const gostos = [comidaFavorita, filmeFavorito].filter(Boolean)

  useEffect(() => {
    if (!started || totalDias <= 0) return
    let f = 0
    const iv = setInterval(() => {
      f++
      setDiasAnim(Math.round(totalDias * (1 - Math.pow(1 - Math.min(f / 50, 1), 3))))
      if (f >= 50) clearInterval(iv)
    }, 30)
    return () => clearInterval(iv)
  }, [totalDias, started])

  useEffect(() => {
    document.body.style.overflow = removido ? 'unset' : 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [removido])

  // Manual IntersectionObserver for music drop (more reliable with scroll-snap)
  useEffect(() => {
    if (!started || !musicSectionRef.current) return
    const el = musicSectionRef.current
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        console.log('[Wrapped Audio] Music section VISIBLE via IO')
        setIsMusicVisible(true)
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])


  // DEBUG + CROSSFADE
  useEffect(() => {
    console.log('[Wrapped Audio] previewUrl:', previewUrl)
    console.log('[Wrapped Audio] isMusicVisible:', isMusicVisible, 'dropped:', dropped, 'started:', started)
  }, [previewUrl, isMusicVisible, dropped, started])

  useEffect(() => {
    if (!isMusicVisible || dropped || !started) return
    setDropped(true)
    console.log('[Wrapped Audio] DROP triggered! URL:', previewUrl)
    const bg = bgRef.current
    if (bg) {
      const fade = setInterval(() => {
        const v = bg.volume - 0.05
        if (v <= 0) { clearInterval(fade); bg.pause(); bg.volume = 0 }
        else bg.volume = v
      }, 80)
    }
    if (previewUrl) {
      const drop = new Audio(previewUrl)
      drop.volume = 0
      drop.loop = true
      drop.setAttribute('playsinline', 'true')
      drop.play()
        .then(() => console.log('[Wrapped Audio] Couple music PLAYING'))
        .catch(e => console.error('[Wrapped Audio] Play BLOCKED:', e))
      dropRef.current = drop
      let v = 0
      const fadeIn = setInterval(() => {
        v = Math.min(v + 0.08, 0.7)
        drop.volume = v
        if (v >= 0.7) clearInterval(fadeIn)
      }, 80)
    } else {
      console.warn('[Wrapped Audio] No previewUrl available!')
    }
  }, [isMusicVisible, dropped, started, previewUrl])

  function iniciar() {
    console.log('[Wrapped Audio] Starting BG loop...')
    const bg = new Audio(BG_LOOP)
    bg.volume = 0.2
    bg.loop = true
    bg.setAttribute('playsinline', 'true')
    bg.play()
      .then(() => console.log('[Wrapped Audio] BG loop PLAYING'))
      .catch(e => console.error('[Wrapped Audio] BG BLOCKED:', e))
    bgRef.current = bg
    setStarted(true)
  }

  function unlock() {
    setSaindo(true)
    const a = dropRef.current || bgRef.current
    if (a) {
      const fade = setInterval(() => {
        const v = a.volume - 0.04
        if (v <= 0) { clearInterval(fade); a.pause(); a.src = '' }
        else a.volume = v
      }, 40)
    }
    setTimeout(() => { setRemovido(true); onDesbloquear() }, 1200)
  }

  if (removido) return null

  if (!started) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center" style={{ background: '#000' }}>
        <style>{`
        `}</style>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-8 max-w-sm relative z-10">
          <motion.button onClick={iniciar} initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="w-24 h-24 rounded-full mx-auto mb-12 flex items-center justify-center cursor-pointer"
            style={{ border: `2px solid ${cor}50`, background: `${cor}12` }}>
            <Volume2 className="w-9 h-9" style={{ color: cor }} />
          </motion.button>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-2xl sm:text-3xl font-black mb-4 tracking-tight">
            Preparamos algo especial
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="text-sm mb-14" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Ative o som para a melhor experiencia.
          </motion.p>
          <motion.button onClick={iniciar} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }} whileTap={{ scale: 0.96 }}
            className="px-10 py-4 rounded-full font-bold text-white text-base"
            style={{ background: cor }}>
            Iniciar experiencia
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-scroll snap-y snap-mandatory"
      style={{ opacity: saindo ? 0 : 1, pointerEvents: saindo ? 'none' : 'auto',
        transition: 'opacity 1s ease-out', background: '#000', scrollbarWidth: 'none' }}>
      <style>{`
        *::-webkit-scrollbar{display:none}
        @keyframes spin-slow{to{transform:rotate(360deg)}}
        @keyframes globe-spin{to{transform:rotateY(360deg)}}
        @keyframes ping-radar{0%{transform:scale(0.3);opacity:0.5}100%{transform:scale(1);opacity:0}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes draw-line{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
        @keyframes wave-drift{0%,100%{d:path('M-30,180 Q80,80 200,280 T430,220')}50%{d:path('M-30,200 Q100,120 180,260 T430,240')}}
        @keyframes wave-float-1{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
        @keyframes wave-float-2{0%,100%{transform:translateY(0)}50%{transform:translateY(12px)}}
        @keyframes wave-float-3{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .outlined-modern{color:transparent;-webkit-text-stroke:2.5px #fff;font-weight:900;line-height:0.85;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
      `}</style>

      {/* ===== TELA 1 — O GANCHO ===== */}
      <section className="h-screen w-screen snap-start flex items-end relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}
          viewBox="0 0 400 800" fill="none" preserveAspectRatio="none">
          <motion.path d="M-30,180 Q80,80 200,280 T430,220"
            stroke={cor} strokeWidth="3" strokeLinecap="round" fill="none"
            strokeDasharray="1000" strokeDashoffset="1000" style={{ animation: 'draw-line 3s ease-in-out 0.3s forwards, wave-float-1 6s ease-in-out 3.5s infinite' }}
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.3, duration: 0.5 }} />
          <motion.path d="M-30,450 Q140,350 260,520 T430,440"
            stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" fill="none"
            strokeDasharray="1000" strokeDashoffset="1000" style={{ animation: 'draw-line 3.5s ease-in-out 0.8s forwards, wave-float-2 7s ease-in-out 4.5s infinite' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
          <motion.path d="M-30,620 Q180,540 310,680 T430,620"
            stroke={`${cor}50`} strokeWidth="3.5" fill="none"
            strokeDasharray="1000" strokeDashoffset="1000" style={{ animation: 'draw-line 4s ease-in-out 1.2s forwards, wave-float-3 8s ease-in-out 5.5s infinite' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} />
          
          
        </svg>

        <div className="relative z-10 px-8 sm:px-12 pb-28 max-w-xl">
          <motion.div initial={{ width: 0 }} animate={{ width: 48 }}
            transition={{ delay: 0.3, duration: 1 }} className="h-0.5 mb-8" style={{ background: cor }} />
          <motion.p initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.02] tracking-tight">
            O mundo<br />girou e...
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
            className="text-base mt-8 nome-capitalize" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {titulo}
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}
            className="w-6 h-9 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <motion.div animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-1 h-2 rounded-full bg-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== TELA 2 — OS NÚMEROS ===== */}
      {totalDias > 0 && (
        <section className="h-screen w-screen snap-start flex items-center relative overflow-hidden">
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] pointer-events-none" style={{ zIndex: 0, opacity: 0.07 }}>
            <div className="absolute inset-0 animate-[spin-slow_30s_linear_infinite]">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="absolute rounded-full border border-white"
                  style={{ inset: `${i*42}px`, borderWidth: i%2===0 ? 2.5 : 1 }} />
              ))}
            </div>
          </div>

          <div className="relative z-10 w-full px-8 sm:px-12">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-xs uppercase tracking-[0.3em] mb-8" style={{ color: cor }}>
              Desde o primeiro dia
            </motion.p>
            <motion.div initial={{ opacity: 0, x: -100 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 1, type: 'spring' }}
              className="-ml-3 sm:-ml-8">
              <p className="outlined-modern text-[150px] sm:text-[220px] md:text-[280px] tabular-nums"
                style={{ transform: 'rotate(-3deg)' }}>
                {diasAnim}
              </p>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl mt-6" style={{ color: 'rgba(255,255,255,0.85)' }}>
              dias desde que tudo mudou.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.8 }}
              className="text-base mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {totalHoras.toLocaleString('pt-BR')} horas. Cada uma delas, com voce.
            </motion.p>
          </div>
        </section>
      )}

      {/* ===== TELA 3A — O COSMOS (GLOBO REAL) ===== */}
      <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
        <div className="absolute pointer-events-none" style={{ zIndex: 0, perspective: '800px' }}>
          <div style={{ width: 320, height: 320, animation: 'globe-spin 20s linear infinite', transformStyle: 'preserve-3d' }}>
            <svg width="320" height="320" viewBox="0 0 320 320" fill="none" className="opacity-[0.12]">
              <circle cx="160" cy="160" r="140" stroke="white" strokeWidth="1" />
              <circle cx="160" cy="160" r="100" stroke="white" strokeWidth="0.5" />
              <circle cx="160" cy="160" r="50" stroke="white" strokeWidth="0.3" />
              <ellipse cx="160" cy="160" rx="140" ry="40" stroke="white" strokeWidth="0.6" />
              <ellipse cx="160" cy="160" rx="140" ry="70" stroke="white" strokeWidth="0.4" />
              <ellipse cx="160" cy="160" rx="140" ry="110" stroke="white" strokeWidth="0.3" />
              <ellipse cx="160" cy="160" rx="40" ry="140" stroke="white" strokeWidth="0.6" />
              <ellipse cx="160" cy="160" rx="80" ry="140" stroke="white" strokeWidth="0.4" />
              <ellipse cx="160" cy="160" rx="120" ry="140" stroke="white" strokeWidth="0.3" />
              <line x1="20" y1="160" x2="300" y2="160" stroke="white" strokeWidth="0.4" />
              <line x1="160" y1="20" x2="160" y2="300" stroke="white" strokeWidth="0.4" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 text-center px-8 max-w-lg flex flex-col items-center gap-8">
          <motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight"
            style={{ color: 'rgba(255,255,255,0.9)' }}>
            Em um universo com<br />{UNIVERSE.age}...
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg sm:text-xl" style={{ color: 'rgba(255,255,255,0.55)' }}>
            E um planeta que gira a {UNIVERSE.earthSpeed} no escuro...
          </motion.p>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
            viewport={{ once: true }} transition={{ delay: 1, duration: 0.6 }}
            className="w-12 h-px" style={{ background: cor }} />
        </div>
      </section>

      {/* ===== TELA 3B — RADAR + CIDADE ===== */}
      {cidadeEncontro && (
        <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="absolute rounded-full" style={{
                width: `${30+i*14}vw`, height: `${30+i*14}vw`,
                maxWidth: `${200+i*90}px`, maxHeight: `${200+i*90}px`,
                border: `${i===0?2:1}px solid ${cor}`,
                opacity: 0.08 + (i===0?0.15:0),
                animation: `ping-radar ${3+i*0.8}s ease-out ${i*0.6}s infinite`,
              }} />
            ))}
            <div className="w-5 h-5 rounded-full" style={{ background: cor, opacity: 0.6, boxShadow: `0 0 50px ${cor}` }} />
          </div>

          <div className="relative z-10 text-center px-8 max-w-lg flex flex-col items-center gap-10">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              A maior das coincidencias aconteceu.
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Entre 8 bilhoes de pessoas,<br />nossos caminhos se cruzaram em:
            </motion.p>
            <motion.p initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.8, duration: 0.6, type: 'spring' }}
              className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight">
              {cidadeEncontro}
            </motion.p>
          </div>
        </section>
      )}

      {/* ===== TELA 4 — MARQUEE GOSTOS ===== */}
      {gostos.length > 0 && (
        <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-center gap-10 pointer-events-none select-none" style={{ zIndex: 0, opacity: 0.035 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="whitespace-nowrap" style={{
                animation: `marquee ${20+i*5}s linear infinite`,
                animationDirection: i%2 ? 'reverse' : 'normal',
              }}>
                <span className="text-7xl sm:text-9xl font-black uppercase tracking-tight">
                  {(gostos.join(' & ') + '   ').repeat(8)}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-10 text-center px-8 max-w-lg flex flex-col items-center gap-12">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-xs uppercase tracking-[0.3em]" style={{ color: cor }}>
              A linguagem do amor de voces
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight whitespace-nowrap leading-tight">
              {gostos.join(' & ')}
            </motion.p>
          </div>
        </section>
      )}

      {/* ===== TELA 5 — MÚSICA (METEORO DROP) ===== */}
      <section ref={musicSectionRef} className="h-screen w-screen snap-start flex flex-col items-center justify-center relative overflow-hidden gap-12">
        {musicaCapa ? (
          <>
            {/* Album cover — METEOR entry */}
            <motion.div
              initial={{ opacity: 0, x: -300, rotate: -45, scale: 0.5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 100, damping: 10 }}
              className="relative z-10"
            >
              
              <div className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={musicaCapa} alt="" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.6 }}
              className="relative z-10 text-center px-8">
              <p className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
                A trilha sonora de voces.
              </p>
              {musicaNome && <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{musicaNome}</p>}
            </motion.div>
          </>
        ) : (
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-xl relative z-10 font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Cada momento tem sua trilha sonora.
          </motion.p>
        )}
      </section>

      {/* ===== TELA 6 — DESBLOQUEIO ===== */}
      <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ zIndex: 0, opacity: 0.025 }}>
          <p className="outlined-modern text-[220px] sm:text-[320px] md:text-[420px] leading-none"
            style={{ transform: 'rotate(-8deg)' }}>&hearts;</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-8 max-w-sm flex flex-col items-center gap-16">
          <p className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.65)' }}>
            Mas os numeros<br />nao contam tudo.
          </p>
          <motion.button onClick={unlock} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="group px-14 py-6 rounded-full text-lg font-bold text-white flex items-center gap-3"
            style={{ background: cor, boxShadow: `0 0 50px ${cor}50` }}>
            <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Destrancar nossa pagina
          </motion.button>
          <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.06)' }}>eternizar</p>
        </motion.div>
      </section>
    </div>
  )
}
