'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
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

export default function EternizarWrapped({ titulo, dataInicio, comidaFavorita, filmeFavorito, cidadeEncontro, musicaCapa, musicaNome, previewUrl, cor, fontes, onDesbloquear }: Props) {
  const [hasStarted, setHasStarted] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const [removido, setRemovido] = useState(false)
  const [diasAnim, setDiasAnim] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const totalDias = dataInicio ? Math.floor((Date.now() - new Date(dataInicio).getTime()) / 86400000) : 0

  // Count-up animation
  useEffect(() => {
    if (totalDias <= 0 || !hasStarted) return
    let f = 0
    const iv = setInterval(() => {
      f++
      const p = Math.min(f / 50, 1)
      setDiasAnim(Math.round(totalDias * (1 - Math.pow(1 - p, 3))))
      if (f >= 50) clearInterval(iv)
    }, 30)
    return () => clearInterval(iv)
  }, [totalDias, hasStarted])

  // Lock body scroll until started
  useEffect(() => {
    document.body.style.overflow = removido ? 'unset' : 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [removido])

  function iniciar() {
    // User gesture → unlock audio autoplay
    if (previewUrl) {
      const audio = new Audio(previewUrl)
      audio.volume = 0.4
      audio.loop = true
      audio.setAttribute('playsinline', 'true')
      audio.play().catch(() => {})
      audioRef.current = audio
    }
    setHasStarted(true)
  }

  function unlock() {
    setSaindo(true)
    // Fade out wrapped audio, let page player take over
    if (audioRef.current) {
      const audio = audioRef.current
      let vol = audio.volume
      const fade = setInterval(() => {
        vol -= 0.05
        if (vol <= 0) { clearInterval(fade); audio.pause(); audio.src = '' }
        else audio.volume = vol
      }, 50)
    }
    setTimeout(() => { setRemovido(true); onDesbloquear() }, 1200)
  }

  if (removido) return null

  const gostos = [comidaFavorita, filmeFavorito].filter(Boolean).join(' & ')
  const filmeRef = totalDias > 0 ? Math.floor(totalDias * 24 / 2.1) : 0

  // ===== OVERLAY: TAP TO START =====
  if (!hasStarted) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center" style={{ background: '#000' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }} className="text-center px-8 max-w-sm">

          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3, bounce: 0.3 }}
            className="w-20 h-20 rounded-full mx-auto mb-10 flex items-center justify-center cursor-pointer"
            style={{ border: `2px solid ${cor}40`, background: `${cor}15` }}
            onClick={iniciar}>
            <Volume2 className="w-8 h-8" style={{ color: cor }} />
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-xl sm:text-2xl font-black mb-4"
            style={{ fontFamily: fontes.titulo }}>
            Preparamos algo especial
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="text-sm mb-12" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Ative o som para a melhor experiencia.
          </motion.p>

          <motion.button onClick={iniciar}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
            whileTap={{ scale: 0.96 }}
            className="px-10 py-4 rounded-full font-bold text-white text-sm"
            style={{ background: cor }}>
            Iniciar experiencia
          </motion.button>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            className="text-[9px] uppercase tracking-[0.3em] mt-16"
            style={{ color: 'rgba(255,255,255,0.08)' }}>
            eternizar
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // ===== WRAPPED EXPERIENCE =====
  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-scroll snap-y snap-mandatory"
      style={{
        opacity: saindo ? 0 : 1,
        pointerEvents: saindo ? 'none' : 'auto',
        transition: 'opacity 1s ease-out',
        background: '#000',
        scrollbarWidth: 'none',
      }}
    >
      <style>{`
        .wrapped-container::-webkit-scrollbar{display:none}
        @keyframes spin-slow{to{transform:rotate(360deg)}}
        @keyframes ping-ring{0%{transform:scale(1);opacity:0.5}100%{transform:scale(8);opacity:0}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-15px) rotate(2deg)}}
        .outlined{color:transparent;-webkit-text-stroke:2px #fff;font-weight:900;line-height:0.85}
      `}</style>

      {/* ===== TELA 1 — O GANCHO ===== */}
      <section className="h-screen w-screen snap-start flex items-end relative overflow-hidden">
        {/* SVG scribble lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}
          viewBox="0 0 400 800" fill="none" preserveAspectRatio="none">
          <motion.path d="M-20,200 Q100,100 200,300 T420,250"
            stroke={cor} strokeWidth="1.5" fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.15 }}
            transition={{ duration: 3, delay: 0.3 }} />
          <motion.path d="M-20,500 Q150,400 250,550 T420,480"
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 3.5, delay: 0.8 }} />
          <motion.path d="M-20,650 Q200,580 300,700 T420,650"
            stroke={`${cor}25`} strokeWidth="1.5" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 4, delay: 1.2 }} />
        </svg>

        <div className="relative z-10 px-8 sm:px-12 pb-28 max-w-xl">
          <motion.div initial={{ width: 0 }} animate={{ width: 40 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="h-px mb-8" style={{ background: cor }} />
          <motion.p initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05]"
            style={{ fontFamily: fontes.titulo }}>
            O mundo<br />girou e...
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-sm mt-6 nome-capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {titulo}
          </motion.p>
        </div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <motion.div animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-1 h-1.5 rounded-full bg-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== TELA 2 — OS NÚMEROS ===== */}
      {totalDias > 0 && (
        <section className="h-screen w-screen snap-start flex items-center relative overflow-hidden">
          {/* Concentric circles */}
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] pointer-events-none" style={{ zIndex: 0, opacity: 0.05 }}>
            <div className="absolute inset-0 animate-[spin-slow_40s_linear_infinite]">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="absolute rounded-full border border-white"
                  style={{ inset: `${i * 40}px`, borderWidth: i === 3 ? 2 : 1 }} />
              ))}
            </div>
          </div>

          <div className="relative z-10 w-full px-8 sm:px-12">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.3em] mb-6" style={{ color: cor }}>
              Desde o primeiro dia
            </motion.p>

            <motion.div initial={{ opacity: 0, x: -80 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 1, type: 'spring' }}
              className="-ml-2 sm:-ml-6">
              <p className="outlined text-[130px] sm:text-[180px] md:text-[240px] tabular-nums"
                style={{ transform: 'rotate(-3deg)' }}>
                {diasAnim}
              </p>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="text-base sm:text-lg mt-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
              dias desde que tudo mudou.
            </motion.p>

            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.8 }}
              className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Tempo suficiente para assistir La La Land {filmeRef.toLocaleString('pt-BR')} vezes.
            </motion.p>
          </div>
        </section>
      )}

      {/* ===== TELA 3 — O LOCAL ===== */}
      {cidadeEncontro && (
        <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
          {/* Radar rings — centered behind text, large scale */}
          <div className="absolute pointer-events-none" style={{ zIndex: 0, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            {[0,1,2,3].map(i => (
              <div key={i} className="absolute rounded-full" style={{
                width: 20, height: 20, marginLeft: -10, marginTop: -10,
                border: `1px solid ${cor}40`,
                animation: `ping-ring 4s ease-out ${i * 1}s infinite`,
              }} />
            ))}
            <div className="w-4 h-4 rounded-full -ml-2 -mt-2" style={{ background: cor, opacity: 0.6, boxShadow: `0 0 30px ${cor}` }} />
          </div>

          <div className="relative z-10 text-center px-8 max-w-lg flex flex-col items-center gap-8">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              De 8 bilhoes de pessoas,<br />tudo convergiu em:
            </motion.p>

            <motion.p initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.5, type: 'spring' }}
              className="text-4xl sm:text-5xl md:text-6xl font-black uppercase"
              style={{ fontFamily: fontes.titulo }}>
              {cidadeEncontro}
            </motion.p>

            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.6 }}
              className="w-12 h-px" style={{ background: cor }} />
          </div>
        </section>
      )}

      {/* ===== TELA 4 — OS GOSTOS ===== */}
      {gostos && (
        <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
          {/* Marquee background */}
          <div className="absolute inset-0 flex flex-col justify-center gap-8 pointer-events-none select-none" style={{ zIndex: 0, opacity: 0.03 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="whitespace-nowrap" style={{
                animation: `marquee ${18 + i * 4}s linear infinite`,
                animationDirection: i % 2 ? 'reverse' : 'normal',
              }}>
                <span className="text-6xl sm:text-8xl font-black uppercase" style={{ fontFamily: fontes.titulo }}>
                  {(gostos + '   ').repeat(10)}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-10 text-center px-8 max-w-lg flex flex-col items-center gap-10">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.3em]" style={{ color: cor }}>
              A linguagem do amor de voces
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="flex flex-col items-center gap-2">
              {comidaFavorita && (
                <p className="text-5xl sm:text-6xl md:text-7xl font-black" style={{ fontFamily: fontes.titulo }}>
                  {comidaFavorita}
                </p>
              )}
              {comidaFavorita && filmeFavorito && (
                <p className="text-base" style={{ color: 'rgba(255,255,255,0.25)' }}>&</p>
              )}
              {filmeFavorito && (
                <p className="text-4xl sm:text-5xl md:text-6xl font-black italic" style={{ fontFamily: fontes.titulo }}>
                  {filmeFavorito}
                </p>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== TELA 5 — A MÚSICA ===== */}
      {musicaCapa && (
        <section className="h-screen w-screen snap-start flex flex-col items-center justify-center relative overflow-hidden gap-10">
          {/* Album art */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: 'spring', bounce: 0.25 }}
            className="relative z-10"
          >
            <div className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: cor, filter: 'blur(50px)', opacity: 0.15, transform: 'scale(1.4)' }} />
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl"
              style={{ animation: 'float 6s ease-in-out infinite' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={musicaCapa} alt="" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.6 }}
            className="relative z-10 text-center px-8">
            <p className="text-lg sm:text-xl" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: fontes.titulo }}>
              A trilha sonora de voces.
            </p>
            {musicaNome && (
              <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{musicaNome}</p>
            )}
          </motion.div>
        </section>
      )}

      {/* ===== TELA 6 — DESBLOQUEIO ===== */}
      <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ zIndex: 0, opacity: 0.02 }}>
          <p className="outlined text-[200px] sm:text-[300px] md:text-[400px] leading-none"
            style={{ transform: 'rotate(-8deg)' }}>&hearts;</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-8 max-w-sm flex flex-col items-center gap-16">
          <p className="text-2xl sm:text-3xl md:text-4xl leading-relaxed"
            style={{ fontFamily: fontes.titulo, color: 'rgba(255,255,255,0.55)' }}>
            Mas os numeros<br />nao contam tudo.
          </p>

          <motion.button onClick={unlock} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="group px-12 py-5 rounded-full text-base sm:text-lg font-bold text-white flex items-center gap-3"
            style={{ background: cor, boxShadow: `0 0 40px ${cor}40` }}>
            <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Destrancar nossa pagina
          </motion.button>

          <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.08)' }}>
            eternizar
          </p>
        </motion.div>
      </section>
    </div>
  )
}
