'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, Lock } from 'lucide-react'

interface Props {
  titulo: string
  fotoCapa?: string | null
  dataInicio?: string
  comidaFavorita?: string
  cor: string
  fontes: { titulo: string; corpo: string }
  onDesbloquear: () => void
}

export default function EternizarWrapped({ titulo, dataInicio, comidaFavorita, cor, fontes, onDesbloquear }: Props) {
  const [saindo, setSaindo] = useState(false)
  const [removido, setRemovido] = useState(false)
  const [diasAnimados, setDiasAnimados] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalDias = dataInicio ? Math.floor((Date.now() - new Date(dataInicio).getTime()) / 86400000) : 0
  const filmeRef = totalDias > 0 ? Math.floor(totalDias * 24 / 2.1) : 0

  // Count-up
  useEffect(() => {
    if (totalDias <= 0) return
    let frame = 0
    const dur = 60
    const iv = setInterval(() => {
      frame++
      const p = Math.min(frame / dur, 1)
      setDiasAnimados(Math.round(totalDias * (1 - Math.pow(1 - p, 3))))
      if (frame >= dur) clearInterval(iv)
    }, 25)
    return () => clearInterval(iv)
  }, [totalDias])

  function desbloquear() {
    setSaindo(true)
    setTimeout(() => { setRemovido(true); onDesbloquear() }, 1200)
  }

  if (removido) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-y-scroll snap-y snap-mandatory"
      style={{
        opacity: saindo ? 0 : 1,
        pointerEvents: saindo ? 'none' : 'auto',
        transition: 'opacity 1s ease-out',
        background: '#000',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <style>{`
        .wrapped-scroll::-webkit-scrollbar { display: none; }
        @keyframes aura-morph {
          0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg) scale(1); }
          25% { border-radius: 60% 40% 30% 70% / 50% 60% 40% 60%; transform: rotate(90deg) scale(1.05); }
          50% { border-radius: 50% 60% 50% 40% / 60% 30% 70% 40%; transform: rotate(180deg) scale(0.95); }
          75% { border-radius: 30% 70% 60% 40% / 40% 60% 50% 50%; transform: rotate(270deg) scale(1.03); }
        }
        @keyframes aura-pulse {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.2; }
        }
      `}</style>

      {/* ===== TELA 1 — INTRO ===== */}
      <section className="h-screen w-screen snap-start flex flex-col items-center justify-center relative overflow-hidden">
        {/* Aura blob */}
        <div className="absolute pointer-events-none" style={{
          width: '60vw', height: '60vw', maxWidth: 600, maxHeight: 600,
          background: `${cor}`,
          filter: 'blur(100px)',
          opacity: 0.15,
          animation: 'aura-morph 20s ease-in-out infinite, aura-pulse 8s ease-in-out infinite',
        }} />

        <div className="relative z-10 text-center px-8 max-w-lg">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 0.5, duration: 1.2 }}
            className="h-px mx-auto mb-12"
            style={{ background: cor }}
          />

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1]"
            style={{ fontFamily: fontes.titulo, color: 'white' }}
          >
            Uma historia<br />em cada segundo.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="text-xs mt-8 nome-capitalize"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {titulo}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Deslize para cima
          </p>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronUp className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== TELA 2 — OS NÚMEROS ===== */}
      {dataInicio && totalDias > 0 && (
        <section className="h-screen w-screen snap-start flex flex-col items-center justify-center relative overflow-hidden">
          {/* Aura */}
          <div className="absolute pointer-events-none" style={{
            width: '50vw', height: '50vw', maxWidth: 500, maxHeight: 500,
            background: cor,
            filter: 'blur(120px)',
            opacity: 0.1,
            animation: 'aura-morph 25s ease-in-out infinite reverse',
            top: '20%', right: '-10%',
          }} />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center px-8"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] mb-10" style={{ color: cor }}>
              Desde o primeiro dia...
            </p>

            <p className="text-[120px] sm:text-[160px] md:text-[200px] font-black leading-none tabular-nums"
              style={{ fontFamily: fontes.titulo, color: 'white' }}>
              {diasAnimados}
            </p>

            <p className="text-xl sm:text-2xl font-bold mt-2 uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              dias
            </p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="text-xs mt-14 max-w-xs mx-auto leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              Tempo suficiente para assistir La La Land<br />{filmeRef.toLocaleString('pt-BR')} vezes.
            </motion.p>
          </motion.div>
        </section>
      )}

      {/* ===== TELA 3 — OS GOSTOS ===== */}
      {comidaFavorita && (
        <section className="h-screen w-screen snap-start flex flex-col items-center justify-center relative overflow-hidden">
          {/* Aura */}
          <div className="absolute pointer-events-none" style={{
            width: '70vw', height: '70vw', maxWidth: 700, maxHeight: 700,
            background: cor,
            filter: 'blur(130px)',
            opacity: 0.08,
            animation: 'aura-morph 18s ease-in-out infinite',
            bottom: '-20%', left: '-15%',
          }} />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center px-8"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] mb-14" style={{ color: cor }}>
              A linguagem do amor de voces
            </p>

            <motion.p
              initial={{ scale: 0.3, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.25 }}
              className="text-6xl sm:text-8xl md:text-9xl font-black italic uppercase leading-none"
              style={{ fontFamily: fontes.titulo, color: 'white' }}
            >
              {comidaFavorita}
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="w-16 h-0.5 mx-auto mt-10"
              style={{ background: cor }}
            />
          </motion.div>
        </section>
      )}

      {/* ===== TELA 4 — DESBLOQUEIO ===== */}
      <section className="h-screen w-screen snap-start flex flex-col items-center justify-center relative overflow-hidden">
        {/* Aura */}
        <div className="absolute pointer-events-none" style={{
          width: '55vw', height: '55vw', maxWidth: 550, maxHeight: 550,
          background: cor,
          filter: 'blur(110px)',
          opacity: 0.12,
          animation: 'aura-morph 22s ease-in-out infinite',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-8 max-w-md"
        >
          <p className="text-xl sm:text-2xl md:text-3xl leading-relaxed mb-14"
            style={{ fontFamily: fontes.titulo, color: 'rgba(255,255,255,0.5)' }}>
            Mas os numeros<br />nao contam tudo.
          </p>

          <motion.button
            onClick={desbloquear}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group px-10 py-5 rounded-full text-base sm:text-lg font-bold text-white flex items-center gap-3 mx-auto"
            style={{ background: cor }}
          >
            <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Destrancar nossa pagina
          </motion.button>

          <p className="text-[9px] uppercase tracking-[0.3em] mt-20" style={{ color: 'rgba(255,255,255,0.08)' }}>
            eternizar
          </p>
        </motion.div>
      </section>
    </div>
  )
}
