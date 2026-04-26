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

export default function EternizarWrapped({ titulo, fotoCapa, dataInicio, comidaFavorita, cor, fontes, onDesbloquear }: Props) {
  const [saindo, setSaindo] = useState(false)
  const [removido, setRemovido] = useState(false)
  const [diasContados, setDiasContados] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Count-up animation for days
  useEffect(() => {
    if (!dataInicio) return
    const totalDias = Math.floor((Date.now() - new Date(dataInicio).getTime()) / 86400000)
    if (totalDias <= 0) return
    let frame = 0
    const duration = 60
    const iv = setInterval(() => {
      frame++
      const progress = Math.min(frame / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDiasContados(Math.round(totalDias * ease))
      if (frame >= duration) clearInterval(iv)
    }, 25)
    return () => clearInterval(iv)
  }, [dataInicio])

  function desbloquear() {
    setSaindo(true)
    setTimeout(() => {
      setRemovido(true)
      onDesbloquear()
    }, 1200)
  }

  if (removido) return null

  const totalDias = dataInicio ? Math.floor((Date.now() - new Date(dataInicio).getTime()) / 86400000) : 0
  const filmeRef = totalDias > 0 ? Math.floor(totalDias * 24 / 2.1) : 0

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{
        opacity: saindo ? 0 : 1,
        pointerEvents: saindo ? 'none' : 'auto',
        transition: 'opacity 1s ease-out',
        background: '#000',
      }}
    >
      {/* ===== SEÇÃO 1 — INTRO ===== */}
      <section className="h-screen w-screen snap-start flex flex-col items-center justify-center relative overflow-hidden">
        {fotoCapa && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotoCapa} alt="" className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.25) blur(6px)', transform: 'scale(1.1)' }} />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, #000 80%)' }} />
          </div>
        )}
        <div className="relative z-10 text-center px-8 max-w-lg">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="h-px mx-auto mb-10"
            style={{ background: cor }}
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight"
            style={{ fontFamily: fontes.titulo, color: 'white' }}
          >
            Uma historia<br />em cada segundo.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-sm mt-6 nome-capitalize"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {titulo}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
        >
          <p className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Deslize para cima</p>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronUp className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== SEÇÃO 2 — OS NÚMEROS ===== */}
      {dataInicio && totalDias > 0 && (
        <section className="h-screen w-screen snap-start flex flex-col items-center justify-center px-8" style={{ background: '#0a0a0a' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-md"
          >
            <p className="text-xs uppercase tracking-[0.3em] mb-8" style={{ color: cor }}>Desde o primeiro dia...</p>
            <p className="text-8xl sm:text-9xl md:text-[160px] font-black leading-none" style={{ fontFamily: fontes.titulo, color: 'white' }}>
              {diasContados}
            </p>
            <p className="text-2xl sm:text-3xl font-bold mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>DIAS</p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="text-sm mt-10 leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Tempo suficiente para assistir La La Land {filmeRef.toLocaleString('pt-BR')} vezes.
            </motion.p>
          </motion.div>
        </section>
      )}

      {/* ===== SEÇÃO 3 — OS GOSTOS ===== */}
      {comidaFavorita && (
        <section className="h-screen w-screen snap-start flex flex-col items-center justify-center px-8" style={{ background: '#050505' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-lg"
          >
            <p className="text-xs uppercase tracking-[0.3em] mb-12" style={{ color: cor }}>A linguagem do amor de voces e:</p>
            <motion.p
              initial={{ scale: 0.3, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
              className="text-6xl sm:text-8xl md:text-9xl font-black italic uppercase"
              style={{ fontFamily: fontes.titulo, color: 'white' }}
            >
              {comidaFavorita}
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="w-20 h-1 mx-auto mt-8 rounded-full"
              style={{ background: cor }}
            />
          </motion.div>
        </section>
      )}

      {/* ===== SEÇÃO 4 — DESBLOQUEIO ===== */}
      <section className="h-screen w-screen snap-start flex flex-col items-center justify-center px-8"
        style={{ background: `radial-gradient(ellipse at center, ${cor}08, #000)` }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-md"
        >
          <p className="text-lg sm:text-xl mb-12 leading-relaxed" style={{ fontFamily: fontes.titulo, color: 'rgba(255,255,255,0.6)' }}>
            Mas os numeros<br />nao contam tudo.
          </p>
          <motion.button
            onClick={desbloquear}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group px-10 py-5 rounded-2xl text-lg font-bold text-white flex items-center gap-3 mx-auto"
            style={{
              background: `linear-gradient(135deg, ${cor}, ${cor}cc)`,
              boxShadow: `0 0 60px ${cor}30`,
            }}
          >
            <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Destrancar nossa pagina
          </motion.button>
          <p className="text-[10px] uppercase tracking-[0.3em] mt-16" style={{ color: 'rgba(255,255,255,0.12)' }}>eternizar</p>
        </motion.div>
      </section>
    </div>
  )
}
