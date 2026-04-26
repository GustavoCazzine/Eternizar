'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Lock, Play } from 'lucide-react'

interface Props {
  titulo: string
  fotoCapa?: string | null
  dataInicio?: string
  comidaFavorita?: string
  filmeFavorito?: string
  cidadeEncontro?: string
  musicaCapa?: string
  musicaNome?: string
  cor: string
  fontes: { titulo: string; corpo: string }
  onDesbloquear: () => void
}

export default function EternizarWrapped({ titulo, dataInicio, comidaFavorita, filmeFavorito, cidadeEncontro, musicaCapa, musicaNome, cor, fontes, onDesbloquear }: Props) {
  const [saindo, setSaindo] = useState(false)
  const [removido, setRemovido] = useState(false)
  const [diasAnim, setDiasAnim] = useState(0)

  const totalDias = dataInicio ? Math.floor((Date.now() - new Date(dataInicio).getTime()) / 86400000) : 0

  useEffect(() => {
    if (totalDias <= 0) return
    let f = 0
    const iv = setInterval(() => {
      f++
      const p = Math.min(f / 50, 1)
      setDiasAnim(Math.round(totalDias * (1 - Math.pow(1 - p, 3))))
      if (f >= 50) clearInterval(iv)
    }, 30)
    return () => clearInterval(iv)
  }, [totalDias])

  function unlock() {
    setSaindo(true)
    setTimeout(() => { setRemovido(true); onDesbloquear() }, 1200)
  }

  if (removido) return null

  const gostos = [comidaFavorita, filmeFavorito].filter(Boolean).join(' & ')

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
        .w-scroll::-webkit-scrollbar{display:none}
        @keyframes draw{to{stroke-dashoffset:0}}
        @keyframes spin-slow{to{transform:rotate(360deg)}}
        @keyframes ping-ring{0%{transform:scale(0.5);opacity:0.6}100%{transform:scale(3);opacity:0}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(3deg)}}
        .outlined{color:transparent;-webkit-text-stroke:2px #fff;font-weight:900;line-height:0.85}
        .outlined-cor{color:transparent;-webkit-text-stroke:2px ${cor};font-weight:900;line-height:0.85}
      `}</style>

      {/* ===== TELA 1 — O GANCHO ===== */}
      <section className="h-screen w-screen snap-start flex items-end relative overflow-hidden">
        {/* SVG Scribble lines animadas */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 800" fill="none" preserveAspectRatio="none">
          <motion.path
            d="M-20,200 Q100,100 200,300 T420,250"
            stroke={cor} strokeWidth="1.5" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }}
          />
          <motion.path
            d="M-20,500 Q150,400 250,550 T420,480"
            stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3.5, delay: 1, ease: 'easeInOut' }}
          />
          <motion.path
            d="M-20,650 Q200,580 300,700 T420,650"
            stroke={`${cor}30`} strokeWidth="2" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, delay: 1.5, ease: 'easeInOut' }}
          />
          <motion.circle cx="320" cy="150" r="60" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 2 }} />
          <motion.circle cx="80" cy="680" r="40" stroke={`${cor}15`} strokeWidth="1" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 2.5 }} />
        </svg>

        {/* Text — asymmetric left-aligned */}
        <div className="relative z-10 px-8 sm:px-12 pb-32 max-w-xl">
          <motion.div initial={{ width: 0 }} animate={{ width: 40 }}
            transition={{ delay: 0.3, duration: 1 }} className="h-px mb-8" style={{ background: cor }} />
          <motion.p initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05]"
            style={{ fontFamily: fontes.titulo }}>
            O mundo<br />girou e...
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="text-xs mt-6 nome-capitalize" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {titulo}
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5">
            <motion.div animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
              className="w-1 h-1.5 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== TELA 2 — OS NÚMEROS ===== */}
      {totalDias > 0 && (
        <section className="h-screen w-screen snap-start flex items-center relative overflow-hidden">
          {/* Concentric circles — bottom right, clipped */}
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px]" style={{ opacity: 0.06 }}>
            <div className="absolute inset-0 animate-[spin-slow_40s_linear_infinite]">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="absolute rounded-full border border-white"
                  style={{ inset: `${i * 40}px`, borderWidth: i === 3 ? 2 : 1 }} />
              ))}
            </div>
          </div>

          <div className="relative z-10 w-full px-8 sm:px-12">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[10px] uppercase tracking-[0.3em] mb-6" style={{ color: cor }}>
              Desde o primeiro dia
            </motion.p>

            {/* Giant outlined number — diagonal, overflowing */}
            <motion.div initial={{ opacity: 0, x: -80 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 1, type: 'spring' }}
              className="relative -ml-4 sm:-ml-8">
              <p className="outlined text-[140px] sm:text-[200px] md:text-[260px] tabular-nums leading-none"
                style={{ transform: 'rotate(-3deg)' }}>
                {diasAnim}
              </p>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.6 }}
              className="text-base sm:text-lg mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              dias desde que tudo mudou.
            </motion.p>
          </div>
        </section>
      )}

      {/* ===== TELA 3 — O LOCAL ===== */}
      {cidadeEncontro && (
        <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
          {/* Radar ping effect */}
          <div className="absolute" style={{ top: '45%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            {[0,1,2].map(i => (
              <div key={i} className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full"
                style={{
                  border: `1px solid ${cor}`,
                  animation: `ping-ring 3s ease-out ${i * 1}s infinite`,
                }} />
            ))}
            <div className="w-3 h-3 rounded-full -ml-1.5 -mt-1.5" style={{ background: cor, boxShadow: `0 0 20px ${cor}` }} />
          </div>

          <div className="relative z-10 text-center px-8 max-w-lg">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-xs mb-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
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
              className="w-12 h-px mx-auto mt-8" style={{ background: cor }} />
          </div>
        </section>
      )}

      {/* ===== TELA 4 — OS GOSTOS ===== */}
      {gostos && (
        <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
          {/* Marquee background */}
          <div className="absolute inset-0 flex flex-col justify-center gap-6 pointer-events-none select-none" style={{ opacity: 0.03 }}>
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} className="whitespace-nowrap" style={{ animation: `marquee ${15 + i * 3}s linear infinite`, animationDirection: i % 2 ? 'reverse' : 'normal' }}>
                <span className="text-6xl sm:text-8xl font-black uppercase" style={{ fontFamily: fontes.titulo }}>
                  {(gostos + '  ').repeat(10)}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-10 text-center px-8 max-w-lg">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[10px] uppercase tracking-[0.3em] mb-10" style={{ color: cor }}>
              A linguagem do amor de voces e
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight"
              style={{ fontFamily: fontes.titulo }}>
              {comidaFavorita && <span>{comidaFavorita}</span>}
              {comidaFavorita && filmeFavorito && (
                <span className="text-lg font-normal mx-3" style={{ color: 'rgba(255,255,255,0.15)' }}>&</span>
              )}
              {filmeFavorito && <span className="italic">{filmeFavorito}</span>}
            </motion.p>
          </div>
        </section>
      )}

      {/* ===== TELA 5 — A MÚSICA ===== */}
      {musicaCapa && (
        <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
          {/* Pulsing album art */}
          <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: 'spring', bounce: 0.3 }}
              className="relative"
            >
              {/* Glow behind */}
              <div className="absolute inset-0 rounded-3xl" style={{ background: cor, filter: 'blur(60px)', opacity: 0.2, transform: 'scale(1.3)' }} />
              {/* Album */}
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl"
                style={{ animation: 'float 6s ease-in-out infinite' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={musicaCapa} alt="" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 text-center px-8 mt-[340px] sm:mt-[400px]">
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.6 }}
              className="text-lg sm:text-xl" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: fontes.titulo }}>
              A trilha sonora de voces.
            </motion.p>
            {musicaNome && (
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 1 }}
                className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {musicaNome}
              </motion.p>
            )}
          </div>
        </section>
      )}

      {/* ===== TELA 6 — DESBLOQUEIO ===== */}
      <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
        {/* Subtle outlined text in background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ opacity: 0.03 }}>
          <p className="outlined text-[200px] sm:text-[300px] md:text-[400px] leading-none" style={{ transform: 'rotate(-8deg)' }}>
            &hearts;
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-8 max-w-sm">
          <p className="text-2xl sm:text-3xl md:text-4xl leading-relaxed mb-16"
            style={{ fontFamily: fontes.titulo, color: 'rgba(255,255,255,0.45)' }}>
            Mas os numeros<br />nao contam tudo.
          </p>

          <motion.button onClick={unlock} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="group px-12 py-5 rounded-full text-base sm:text-lg font-bold text-white flex items-center gap-3 mx-auto"
            style={{ background: cor, boxShadow: `0 0 40px ${cor}40` }}>
            <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Destrancar nossa pagina
          </motion.button>

          <p className="text-[9px] uppercase tracking-[0.3em] mt-20" style={{ color: 'rgba(255,255,255,0.06)' }}>
            eternizar
          </p>
        </motion.div>
      </section>
    </div>
  )
}
