'use client'

import { useState, useEffect, useRef } from 'react'
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

  function entrar() {
    setSaindo(true)
    onEntrar()
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: saindo ? 0 : 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${saindo ? 'pointer-events-none' : ''}`}
      style={{ background: '#121212' }}
    >
      {/* Background photo with slow zoom */}
      {fotoCapa && (
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 8, ease: 'linear' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoCapa} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 20%, #121212 70%)',
          }} />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-8 max-w-md">
        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="w-16 h-px mx-auto mb-8"
          style={{ background: cor }}
        />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-3xl sm:text-4xl font-black mb-4 nome-capitalize"
          style={{ fontFamily: fontes.titulo, color: 'white' }}
        >
          {titulo}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-sm mb-10"
          style={{ color: 'rgba(255,255,255,0.5)', fontFamily: fontes.corpo }}
        >
          Aperte o play para reviver.
        </motion.p>

        {/* Play button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.6, type: 'spring' }}
          onClick={entrar}
          className="group relative w-20 h-20 rounded-full mx-auto flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${cor}, ${cor}cc)`,
            boxShadow: `0 0 60px ${cor}40, 0 0 120px ${cor}20`,
          }}
        >
          <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${cor}` }}
            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        </motion.button>

        {/* Bottom line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-12"
        >
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            eternizar
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
