'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

interface Props {
  fotoCapa?: string | null
  titulo: string
  cor: string
  fontes: { titulo: string; corpo: string }
  onEntrar: () => void
}

export default function IntroWrapped({ fotoCapa, titulo, cor, fontes, onEntrar }: Props) {
  const [saindo, setSaindo] = useState(false)
  const [removido, setRemovido] = useState(false)

  function entrar() {
    setSaindo(true)
    // After fade-out completes, truly remove and unlock
    setTimeout(() => {
      setRemovido(true)
      onEntrar()
    }, 1600)
  }

  if (removido) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: '#000000',
        opacity: saindo ? 0 : 1,
        pointerEvents: saindo ? 'none' : 'auto',
        transition: 'opacity 1.5s ease-out',
      }}
    >
      {/* Background photo blurred */}
      {fotoCapa && (
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoCapa} alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.3) blur(10px)', transform: 'scale(1.1)' }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 20%, #000 75%)',
          }} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-8 max-w-md">
        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="w-16 h-px mx-auto mb-10"
          style={{ background: cor }}
        />

        {/* Impactful phrase */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl sm:text-2xl mb-3 italic"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: 'rgba(255,255,255,0.8)' }}
        >
          Uma historia em cada segundo...
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-3xl sm:text-5xl font-black mb-2 nome-capitalize"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: 'white' }}
        >
          {titulo}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-sm mb-12"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Aperte o play para reviver.
        </motion.p>

        {/* Play button — Glassmorphism */}
        <motion.button
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.6, type: 'spring', bounce: 0.3 }}
          onClick={entrar}
          className="group relative w-24 h-24 rounded-full mx-auto flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${cor}60`,
            boxShadow: `0 0 80px ${cor}30, inset 0 0 40px ${cor}10`,
          }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${cor}, ${cor}bb)` }}>
            <Play className="w-7 h-7 text-white ml-1 group-hover:scale-110 transition-transform" />
          </div>
          {/* Pulse rings */}
          <motion.div className="absolute inset-0 rounded-full"
            style={{ border: `1px solid ${cor}40` }}
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }} />
          <motion.div className="absolute inset-0 rounded-full"
            style={{ border: `1px solid ${cor}30` }}
            animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }} />
        </motion.button>

        {/* Bottom branding */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-14 text-[10px] uppercase tracking-[0.3em]"
          style={{ color: 'rgba(255,255,255,0.15)' }}
        >
          eternizar
        </motion.p>
      </div>
    </div>
  )
}
