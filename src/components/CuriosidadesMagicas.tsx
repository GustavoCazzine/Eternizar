'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface Props {
  dataInicio: string
  cor: string
  fontes: { titulo: string; corpo: string }
}

export default function CuriosidadesMagicas({ dataInicio, cor, fontes }: Props) {
  const fatos = useMemo(() => {
    const inicio = new Date(dataInicio)
    const agora = new Date()
    const diffMs = agora.getTime() - inicio.getTime()
    if (diffMs <= 0) return []

    const totalDias = Math.floor(diffMs / 86400000)
    const totalHoras = Math.floor(diffMs / 3600000)
    const totalMinutos = Math.floor(diffMs / 60000)

    // Contar finais de semana
    let fds = 0
    const d = new Date(inicio)
    while (d <= agora) {
      const dia = d.getDay()
      if (dia === 0 || dia === 6) fds++
      d.setDate(d.getDate() + 1)
    }

    const poresSol = totalDias
    const cafes = totalDias * 2
    const batimentos = Math.floor(totalMinutos * 72)
    const luas = Math.floor(totalDias / 29.5)

    return [
      `${fds.toLocaleString('pt-BR')} finais de semana juntos`,
      `${totalHoras.toLocaleString('pt-BR')} horas desde o primeiro sim`,
      `${poresSol.toLocaleString('pt-BR')} pores do sol compartilhados`,
      `${cafes.toLocaleString('pt-BR')} cafes divididos`,
      `${batimentos.toLocaleString('pt-BR')} batimentos do coracao`,
      `${luas.toLocaleString('pt-BR')} luas cheias juntos`,
      `${totalDias.toLocaleString('pt-BR')} dias escrevendo essa historia`,
    ]
  }, [dataInicio])

  if (fatos.length === 0) return null

  // Duplicate for seamless loop
  const items = [...fatos, ...fatos]

  return (
    <div className="relative overflow-hidden py-8" style={{ maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}>
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, -(fatos.length * 320)] }}
        transition={{ duration: fatos.length * 6, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((fato, i) => (
          <span key={i} className="inline-flex items-center gap-3 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cor }} />
            <span className="text-sm sm:text-base" style={{ fontFamily: fontes.titulo, color: 'rgba(255,255,255,0.65)' }}>
              {fato}
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
