'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { Lock, Volume2 } from 'lucide-react'

interface Props {
  titulo: string
  fotoCapa?: string | null
  dataInicio?: string
  comidaFavorita?: string
  filmeFavorito?: string
  cidadeEncontro?: string
  musicaCapa?: string
  musicaNome?: string
  previewUrl?: string | null
  cor: string
  fontes: { titulo: string; corpo: string }
  onDesbloquear: () => void
}

const BG_LOOP = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'

export default function EternizarWrapped({ titulo, dataInicio, comidaFavorita, filmeFavorito, cidadeEncontro, musicaCapa, musicaNome, previewUrl, cor, fontes, onDesbloquear }: Props) {
  const [hasStarted, setHasStarted] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const [removido, setRemovido] = useState(false)
  const [diasAnim, setDiasAnim] = useState(0)
  const bgAudioRef = useRef<HTMLAudioElement | null>(null)
  const dropAudioRef = useRef<HTMLAudioElement | null>(null)
  const [dropped, setDropped] = useState(false)
  const dropSectionRef = useRef<HTMLDivElement>(null)
  const isDropVisible = useInView(dropSectionRef, { amount: 0.5 })

  const totalDias = dataInicio ? Math.floor((Date.now() - new Date(dataInicio).getTime()) / 86400000) : 0
  const filmeRef = totalDias > 0 ? Math.floor(totalDias * 24 / 2.1) : 0

  // Count-up
  useEffect(() => {
    if (totalDias <= 0 || !hasStarted) return
    let f = 0
    const iv = setInterval(() => {
      f++
      setDiasAnim(Math.round(totalDias * (1 - Math.pow(1 - Math.min(f / 50, 1), 3))))
      if (f >= 50) clearInterval(iv)
    }, 30)
    return () => clearInterval(iv)
  }, [totalDias, hasStarted])

  // Body lock
  useEffect(() => {
    document.body.style.overflow = removido ? 'unset' : 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [removido])

  // Audio drop — when section 5 enters view
  useEffect(() => {
    if (!isDropVisible || dropped || !hasStarted) return
    setDropped(true)
    // Fade out background
    const bg = bgAudioRef.current
    if (bg) {
      let vol = bg.volume
      const fade = setInterval(() => {
        vol -= 0.03
        if (vol <= 0) { clearInterval(fade); bg.pause() }
        else bg.volume = vol
      }, 40)
    }
    // Play couple's music
    if (previewUrl) {
      const drop = new Audio(previewUrl)
      drop.volume = 0.6
      drop.loop = true
      drop.setAttribute('playsinline', 'true')
      drop.play().catch(() => {})
      dropAudioRef.current = drop
    }
  }, [isDropVisible, dropped, hasStarted, previewUrl])

  function iniciar() {
    const bg = new Audio(BG_LOOP)
    bg.volume = 0.25
    bg.loop = true
    bg.setAttribute('playsinline', 'true')
    bg.play().catch(() => {})
    bgAudioRef.current = bg
    setHasStarted(true)
  }

  function unlock() {
    setSaindo(true)
    const a = dropAudioRef.current || bgAudioRef.current
    if (a) {
      let vol = a.volume
      const fade = setInterval(() => {
        vol -= 0.04
        if (vol <= 0) { clearInterval(fade); a.pause(); a.src = '' }
        else a.volume = vol
      }, 40)
    }
    setTimeout(() => { setRemovido(true); onDesbloquear() }, 1200)
  }

  if (removido) return null

  const gostos = [comidaFavorita, filmeFavorito].filter(Boolean)

  // ===== TAP TO START =====
  if (!hasStarted) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center" style={{ background: '#000' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }} className="text-center px-8 max-w-sm">
          <motion.button onClick={iniciar}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3, bounce: 0.3 }}
            className="w-24 h-24 rounded-full mx-auto mb-12 flex items-center justify-center cursor-pointer"
            style={{ border: `2px solid ${cor}50`, background: `${cor}12` }}>
            <Volume2 className="w-9 h-9" style={{ color: cor }} />
          </motion.button>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-2xl sm:text-3xl font-black mb-4" style={{ fontFamily: fontes.titulo }}>
            Preparamos algo especial
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="text-sm mb-14" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Ative o som para a melhor experiencia.
          </motion.p>
          <motion.button onClick={iniciar} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }} whileTap={{ scale: 0.96 }}
            className="px-10 py-4 rounded-full font-bold text-white text-base"
            style={{ background: cor }}>
            Iniciar experiencia
          </motion.button>
          <p className="text-[9px] uppercase tracking-[0.3em] mt-20" style={{ color: 'rgba(255,255,255,0.06)' }}>eternizar</p>
        </motion.div>
      </div>
    )
  }

  // ===== 6 TELAS =====
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-scroll snap-y snap-mandatory"
      style={{ opacity: saindo ? 0 : 1, pointerEvents: saindo ? 'none' : 'auto',
        transition: 'opacity 1s ease-out', background: '#000', scrollbarWidth: 'none' }}>
      <style>{`
        *::-webkit-scrollbar{display:none}
        @keyframes spin-slow{to{transform:rotate(360deg)}}
        @keyframes ping-lg{0%{transform:scale(0.3);opacity:0.4}100%{transform:scale(1);opacity:0}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes float-album{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(2deg)}}
        .outlined{color:transparent;-webkit-text-stroke:2.5px #fff;font-weight:900;line-height:0.85}
      `}</style>

      {/* ===== TELA 1 — O GANCHO ===== */}
      <section className="h-screen w-screen snap-start flex items-end relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}
          viewBox="0 0 400 800" fill="none" preserveAspectRatio="none">
          <motion.path d="M-30,180 Q80,80 200,280 T430,220"
            stroke={cor} strokeWidth="3" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.25 }}
            transition={{ duration: 3, delay: 0.3 }} />
          <motion.path d="M-30,450 Q140,350 260,520 T430,440"
            stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 3.5, delay: 0.8 }} />
          <motion.path d="M-30,620 Q180,540 310,680 T430,620"
            stroke={`${cor}40`} strokeWidth="3.5" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 4, delay: 1.2 }} />
          <motion.circle cx="330" cy="130" r="70" stroke="rgba(255,255,255,0.07)" strokeWidth="2" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, delay: 1.8 }} />
          <motion.circle cx="70" cy="660" r="50" stroke={`${cor}20`} strokeWidth="2.5" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, delay: 2.2 }} />
        </svg>

        <div className="relative z-10 px-8 sm:px-12 pb-28 max-w-xl">
          <motion.div initial={{ width: 0 }} animate={{ width: 48 }}
            transition={{ delay: 0.3, duration: 1 }} className="h-0.5 mb-8" style={{ background: cor }} />
          <motion.p initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.02]"
            style={{ fontFamily: fontes.titulo }}>
            O mundo<br />girou e...
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
            className="text-base mt-8 nome-capitalize" style={{ color: 'rgba(255,255,255,0.8)' }}>
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
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] pointer-events-none" style={{ zIndex: 0, opacity: 0.06 }}>
            <div className="absolute inset-0 animate-[spin-slow_35s_linear_infinite]">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="absolute rounded-full border border-white"
                  style={{ inset: `${i * 42}px`, borderWidth: i % 2 === 0 ? 2.5 : 1 }} />
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
              <p className="outlined text-[150px] sm:text-[220px] md:text-[280px] tabular-nums"
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
              className="text-base mt-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Tempo suficiente para assistir La La Land {filmeRef.toLocaleString('pt-BR')} vezes.
            </motion.p>
          </div>
        </section>
      )}

      {/* ===== TELA 3 — O LOCAL ===== */}
      {cidadeEncontro && (
        <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
          {/* Large radar rings filling the screen */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="absolute rounded-full"
                style={{
                  width: `${30 + i * 12}vw`, height: `${30 + i * 12}vw`,
                  maxWidth: `${200 + i * 80}px`, maxHeight: `${200 + i * 80}px`,
                  border: `${i === 0 ? 2 : 1}px solid ${cor}`,
                  opacity: 0.08 + (i === 0 ? 0.1 : 0),
                  animation: `ping-lg ${3 + i * 0.8}s ease-out ${i * 0.6}s infinite`,
                }} />
            ))}
            <div className="w-5 h-5 rounded-full" style={{ background: cor, opacity: 0.5, boxShadow: `0 0 40px ${cor}` }} />
          </div>

          <div className="relative z-10 text-center px-8 max-w-lg flex flex-col items-center gap-10">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              De 8 bilhoes de pessoas,<br />tudo convergiu em:
            </motion.p>
            <motion.p initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.6, type: 'spring' }}
              className="text-5xl sm:text-6xl md:text-7xl font-black uppercase"
              style={{ fontFamily: fontes.titulo }}>
              {cidadeEncontro}
            </motion.p>
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.6 }}
              className="w-14 h-0.5" style={{ background: cor }} />
          </div>
        </section>
      )}

      {/* ===== TELA 4 — OS GOSTOS ===== */}
      {gostos.length > 0 && (
        <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-center gap-10 pointer-events-none select-none" style={{ zIndex: 0, opacity: 0.035 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="whitespace-nowrap" style={{
                animation: `marquee ${20 + i * 5}s linear infinite`,
                animationDirection: i % 2 ? 'reverse' : 'normal',
              }}>
                <span className="text-7xl sm:text-9xl font-black uppercase" style={{ fontFamily: fontes.titulo }}>
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
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <p className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight whitespace-nowrap"
                style={{ fontFamily: fontes.titulo }}>
                {gostos.join(' & ')}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== TELA 5 — A MÚSICA (DROP) ===== */}
      <section ref={dropSectionRef} className="h-screen w-screen snap-start flex flex-col items-center justify-center relative overflow-hidden gap-12">
        {musicaCapa ? (
          <>
            <motion.div initial={{ opacity: 0, scale: 0.4, rotate: -25 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, type: 'spring', bounce: 0.2 }}
              className="relative z-10">
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: cor, filter: 'blur(60px)', opacity: 0.2, transform: 'scale(1.5)' }} />
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl"
                style={{ animation: 'float-album 6s ease-in-out infinite' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={musicaCapa} alt="" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.8 }}
              className="relative z-10 text-center px-8">
              <p className="text-xl sm:text-2xl" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: fontes.titulo }}>
                A trilha sonora de voces.
              </p>
              {musicaNome && <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.8)' }}>{musicaNome}</p>}
            </motion.div>
          </>
        ) : (
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-xl relative z-10" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: fontes.titulo }}>
            Cada momento tem sua trilha sonora.
          </motion.p>
        )}
      </section>

      {/* ===== TELA 6 — DESBLOQUEIO ===== */}
      <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ zIndex: 0, opacity: 0.025 }}>
          <p className="outlined text-[220px] sm:text-[320px] md:text-[420px] leading-none" style={{ transform: 'rotate(-8deg)' }}>&hearts;</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-8 max-w-sm flex flex-col items-center gap-16">
          <p className="text-3xl sm:text-4xl md:text-5xl leading-relaxed"
            style={{ fontFamily: fontes.titulo, color: 'rgba(255,255,255,0.8)' }}>
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
