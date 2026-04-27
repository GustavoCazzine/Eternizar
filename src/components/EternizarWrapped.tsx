'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Lock, Volume2 } from 'lucide-react'
import createGlobe from 'cobe'
import { UNIVERSE } from '@/lib/constants'

interface Props {
  titulo: string
  dataInicio?: string
  comidaFavorita?: string
  filmeFavorito?: string
  cidadeEncontro?: string
  musicaCapa?: string
  musicaNome?: string
  cor: string
  onDesbloquear: () => void
}

const BG_LOOP = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ]
}

function CobeGlobe({ cor, size = 500 }: { cor: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(0)

  useEffect(() => {
    if (!canvasRef.current) return
    const rgb = hexToRgb(cor)
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 1,
      width: size,
      height: size,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 0,
      mapSamples: 8000,
      mapBrightness: 0,
      baseColor: [0.05, 0.05, 0.05],
      markerColor: rgb,
      glowColor: [rgb[0] * 0.3, rgb[1] * 0.3, rgb[2] * 0.3],
      markers: [],
      opacity: 0.6,
      onRender: (state) => {
        state.phi = phiRef.current
        phiRef.current += 0.003
      },
    })
    return () => globe.destroy()
  }, [cor, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="opacity-[0.18]"
      style={{ width: size / 2, height: size / 2, maxWidth: '70vw', maxHeight: '70vw' }}
    />
  )
}

function SineWaves({ cor }: { cor: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1440 800"
      fill="none"
      preserveAspectRatio="none"
      style={{ zIndex: 0 }}
    >
      <path
        d="M-100,300 C100,200 300,400 500,300 C700,200 900,400 1100,300 C1300,200 1500,400 1600,300"
        stroke={cor}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
        strokeDasharray="3000"
        strokeDashoffset="3000"
        style={{ animation: 'draw-wave 4s ease-out 0.5s forwards, slide-wave 12s linear 4.5s infinite' }}
      />
      <path
        d="M-100,450 C150,350 350,550 550,450 C750,350 950,550 1150,450 C1350,350 1550,550 1600,450"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3000"
        strokeDashoffset="3000"
        style={{ animation: 'draw-wave 5s ease-out 1.5s forwards, slide-wave 15s linear 6.5s infinite reverse' }}
      />
      <path
        d="M-100,580 C200,500 400,650 600,580 C800,500 1000,650 1200,580 C1400,500 1550,650 1600,580"
        stroke={cor}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.15"
        strokeDasharray="3000"
        strokeDashoffset="3000"
        style={{ animation: 'draw-wave 6s ease-out 2.5s forwards, slide-wave 18s linear 8.5s infinite' }}
      />
    </svg>
  )
}

export default function EternizarWrapped({
  titulo,
  dataInicio,
  comidaFavorita,
  filmeFavorito,
  cidadeEncontro,
  musicaCapa,
  musicaNome,
  cor,
  onDesbloquear,
}: Props) {
  const [started, setStarted] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const [removido, setRemovido] = useState(false)
  const [diasAnim, setDiasAnim] = useState(0)
  const bgAudioRef = useRef<HTMLAudioElement | null>(null)

  const totalDias = dataInicio
    ? Math.floor((Date.now() - new Date(dataInicio).getTime()) / 86400000)
    : 0
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
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [removido])

  const iniciar = useCallback(() => {
    const bg = new Audio(BG_LOOP)
    bg.volume = 0.2
    bg.loop = true
    bg.setAttribute('playsinline', 'true')
    bg.play().catch(() => {})
    bgAudioRef.current = bg
    setStarted(true)
  }, [])

  const unlock = useCallback(() => {
    setSaindo(true)
    const a = bgAudioRef.current
    if (a) {
      const fade = setInterval(() => {
        const v = a.volume - 0.04
        if (v <= 0) {
          clearInterval(fade)
          a.pause()
          a.src = ''
        } else {
          a.volume = v
        }
      }, 40)
    }
    setTimeout(() => {
      setRemovido(true)
      onDesbloquear()
    }, 1200)
  }, [onDesbloquear])

  if (removido) return null

  if (!started) {
    return (
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center"
        style={{ background: '#000' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-8 max-w-sm relative z-10"
        >
          <motion.button
            onClick={iniciar}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="w-24 h-24 rounded-full mx-auto mb-12 flex items-center justify-center cursor-pointer"
            style={{ border: `2px solid ${cor}50`, background: `${cor}12` }}
          >
            <Volume2 className="w-9 h-9" style={{ color: cor }} />
          </motion.button>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl sm:text-3xl font-black mb-4 tracking-tight"
          >
            Preparamos algo especial
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm mb-14"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            Ative o som para a melhor experiencia.
          </motion.p>
          <motion.button
            onClick={iniciar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            whileTap={{ scale: 0.96 }}
            className="px-10 py-4 rounded-full font-bold text-white text-base"
            style={{ background: cor }}
          >
            Iniciar experiencia
          </motion.button>
        </motion.div>
      </div>
    )
  }

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
        *::-webkit-scrollbar { display: none }
        @keyframes draw-wave {
          from { stroke-dashoffset: 3000 }
          to { stroke-dashoffset: 0 }
        }
        @keyframes slide-wave {
          from { transform: translateX(0) }
          to { transform: translateX(-200px) }
        }
        @keyframes ping-radar {
          0% { transform: scale(0.3); opacity: 0.5 }
          100% { transform: scale(1); opacity: 0 }
        }
        @keyframes marquee {
          0% { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
        .outlined-modern {
          color: transparent;
          -webkit-text-stroke: 2.5px #fff;
          font-weight: 900;
          line-height: 0.85;
          font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
        }
      `}</style>

      {/* ===== TELA 1 — ONDAS SENOIDAIS ===== */}
      <section className="h-screen w-screen snap-start flex items-end relative overflow-hidden">
        <SineWaves cor={cor} />

        <div className="relative z-10 px-8 sm:px-12 pb-28 max-w-xl">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="h-0.5 mb-8"
            style={{ background: cor }}
          />
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.02] tracking-tight"
          >
            O mundo
            <br />
            girou e...
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-base mt-8 nome-capitalize"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {titulo}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-6 h-9 rounded-full border-2 border-white/20 flex items-start justify-center pt-2"
          >
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-1 h-2 rounded-full bg-white/50"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== TELA 2 — OS NÚMEROS ===== */}
      {totalDias > 0 && (
        <section className="h-screen w-screen snap-start flex items-center relative overflow-hidden">
          <div
            className="absolute -bottom-40 -right-40 w-[600px] h-[600px] pointer-events-none"
            style={{ zIndex: 0, opacity: 0.07 }}
          >
            <div className="absolute inset-0 animate-[spin-slow_30s_linear_infinite]">
              <style>{`@keyframes spin-slow { to { transform: rotate(360deg) } }`}</style>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-white"
                  style={{
                    inset: `${i * 42}px`,
                    borderWidth: i % 2 === 0 ? 2.5 : 1,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 w-full px-8 sm:px-12">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-[0.3em] mb-8"
              style={{ color: cor }}
            >
              Desde o primeiro dia
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: 'spring' }}
              className="-ml-3 sm:-ml-8"
            >
              <p
                className="outlined-modern text-[150px] sm:text-[220px] md:text-[280px] tabular-nums"
                style={{ transform: 'rotate(-3deg)' }}
              >
                {diasAnim}
              </p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl mt-6"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              dias desde que tudo mudou.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="text-base mt-3"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {totalHoras.toLocaleString('pt-BR')} horas. Cada uma delas, com voce.
            </motion.p>
          </div>
        </section>
      )}

      {/* ===== TELA 3A — O COSMOS (COBE GLOBE) ===== */}
      <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
        <div className="absolute pointer-events-none" style={{ zIndex: 0 }}>
          <CobeGlobe cor={cor} size={600} />
        </div>

        <div className="relative z-10 text-center px-8 max-w-lg flex flex-col items-center gap-8">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            Em um universo com
            <br />
            {UNIVERSE.age}...
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg sm:text-xl"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            E um planeta que gira a {UNIVERSE.earthSpeed} no escuro...
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.6 }}
            className="w-12 h-px"
            style={{ background: cor }}
          />
        </div>
      </section>

      {/* ===== TELA 3B — RADAR + CIDADE ===== */}
      {cidadeEncontro && (
        <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 0 }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${30 + i * 14}vw`,
                  height: `${30 + i * 14}vw`,
                  maxWidth: `${200 + i * 90}px`,
                  maxHeight: `${200 + i * 90}px`,
                  border: `${i === 0 ? 2 : 1}px solid ${cor}`,
                  opacity: 0.08 + (i === 0 ? 0.15 : 0),
                  animation: `ping-radar ${3 + i * 0.8}s ease-out ${i * 0.6}s infinite`,
                }}
              />
            ))}
            <div
              className="w-5 h-5 rounded-full"
              style={{
                background: cor,
                opacity: 0.6,
                boxShadow: `0 0 50px ${cor}`,
              }}
            />
          </div>

          <div className="relative z-10 text-center px-8 max-w-lg flex flex-col items-center gap-10">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-base leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              A maior das coincidencias aconteceu.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Entre 8 bilhoes de pessoas,
              <br />
              nossos caminhos se cruzaram em:
            </motion.p>
            <motion.p
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6, type: 'spring' }}
              className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight"
            >
              {cidadeEncontro}
            </motion.p>
          </div>
        </section>
      )}

      {/* ===== TELA 4 — MARQUEE GOSTOS ===== */}
      {gostos.length > 0 && (
        <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 flex flex-col justify-center gap-10 pointer-events-none select-none"
            style={{ zIndex: 0, opacity: 0.035 }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="whitespace-nowrap"
                style={{
                  animation: `marquee ${20 + i * 5}s linear infinite`,
                  animationDirection: i % 2 ? 'reverse' : 'normal',
                }}
              >
                <span className="text-7xl sm:text-9xl font-black uppercase tracking-tight">
                  {(gostos.join(' & ') + '   ').repeat(8)}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-10 text-center px-8 max-w-lg flex flex-col items-center gap-12">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: cor }}
            >
              A linguagem do amor de voces
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight whitespace-nowrap leading-tight"
            >
              {gostos.join(' & ')}
            </motion.p>
          </div>
        </section>
      )}

      {/* ===== TELA 5 — MÚSICA (METEORO) ===== */}
      <section className="h-screen w-screen snap-start flex flex-col items-center justify-center relative overflow-hidden gap-12">
        {musicaCapa ? (
          <>
            <motion.div
              initial={{ opacity: 0, x: -300, rotate: -45, scale: 0.5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 100, damping: 10 }}
              className="relative z-10"
            >
              <div className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={musicaCapa}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="relative z-10 text-center px-8"
            >
              <p
                className="text-xl sm:text-2xl font-bold tracking-tight"
                style={{ color: 'rgba(255,255,255,0.85)' }}
              >
                A trilha sonora de voces.
              </p>
              {musicaNome && (
                <p
                  className="text-sm mt-3"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {musicaNome}
                </p>
              )}
            </motion.div>
          </>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl relative z-10 font-bold"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            Cada momento tem sua trilha sonora.
          </motion.p>
        )}
      </section>

      {/* ===== TELA 6 — DESBLOQUEIO ===== */}
      <section className="h-screen w-screen snap-start flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.025 }}
        >
          <p
            className="outlined-modern text-[220px] sm:text-[320px] md:text-[420px] leading-none"
            style={{ transform: 'rotate(-8deg)' }}
          >
            &hearts;
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-8 max-w-sm flex flex-col items-center gap-16"
        >
          <p
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            Mas os numeros
            <br />
            nao contam tudo.
          </p>
          <motion.button
            onClick={unlock}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group px-14 py-6 rounded-full text-lg font-bold text-white flex items-center gap-3"
            style={{ background: cor, boxShadow: `0 0 50px ${cor}50` }}
          >
            <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Destrancar nossa pagina
          </motion.button>
          <p
            className="text-[9px] uppercase tracking-[0.3em]"
            style={{ color: 'rgba(255,255,255,0.06)' }}
          >
            eternizar
          </p>
        </motion.div>
      </section>
    </div>
  )
}
