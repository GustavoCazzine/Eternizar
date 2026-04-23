'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Share2, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Story { url: string; legenda?: string }
interface Props {
  fotos: Story[]; cor: string; aberto: boolean
  indiceInicial?: number; onFechar: () => void
}

const DURACAO = 7000

export default function StoriesViewer({ fotos, cor, aberto, indiceInicial = 0, onFechar }: Props) {
  const [atual, setAtual] = useState(indiceInicial)
  const [progresso, setProgresso] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [curtido, setCurtido] = useState<Set<number>>(new Set())
  const [mostrarCoracao, setMostrarCoracao] = useState(false)

  const progressoRef = useRef(0)
  const lastTapRef = useRef(0)
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPressRef = useRef(false)
  const swipeStartX = useRef(0)
  const swipeStartY = useRef(0)
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const irPara = useCallback((idx: number) => {
    if (idx < 0 || idx >= fotos.length) { onFechar(); return }
    setAtual(idx)
    setProgresso(0)
    progressoRef.current = 0
  }, [fotos.length, onFechar])

  useEffect(() => {
    if (!aberto || pausado) return
    const passo = 100 / (DURACAO / 50)
    const id = setInterval(() => {
      progressoRef.current += passo
      setProgresso(progressoRef.current)
      if (progressoRef.current >= 100) irPara(atual + 1)
    }, 50)
    return () => clearInterval(id)
  }, [aberto, pausado, atual, irPara])

  useEffect(() => {
    if (aberto) {
      setAtual(indiceInicial); setProgresso(0)
      progressoRef.current = 0; setPausado(false)
    }
  }, [aberto, indiceInicial])

  // Keyboard nav
  useEffect(() => {
    if (!aberto) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar()
      else if (e.key === 'ArrowLeft') irPara(atual - 1)
      else if (e.key === 'ArrowRight') irPara(atual + 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [aberto, atual, irPara, onFechar])

  function fotoPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isPressRef.current = false
    swipeStartX.current = e.clientX
    swipeStartY.current = e.clientY
    pressTimerRef.current = setTimeout(() => {
      isPressRef.current = true
      setPausado(true)
    }, 150)
  }

  function fotoPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current)
    if (isPressRef.current) { isPressRef.current = false; setPausado(false); return }

    const dx = e.clientX - swipeStartX.current
    const dy = e.clientY - swipeStartY.current
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) irPara(atual + 1); else irPara(atual - 1); return
    }

    const agora = Date.now()
    const clientX = e.clientX
    const rect = e.currentTarget.getBoundingClientRect()

    if (agora - lastTapRef.current < 300) {
      if (tapTimerRef.current) { clearTimeout(tapTimerRef.current); tapTimerRef.current = null }
      lastTapRef.current = 0
      setCurtido(prev => { const n = new Set(prev); n.has(atual) ? n.delete(atual) : n.add(atual); return n })
      setMostrarCoracao(true)
      setTimeout(() => setMostrarCoracao(false), 1000)
      return
    }

    lastTapRef.current = agora
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
    tapTimerRef.current = setTimeout(() => {
      tapTimerRef.current = null
      const x = clientX - rect.left
      if (x < rect.width * 0.35) irPara(atual - 1)
      else if (x > rect.width * 0.65) irPara(atual + 1)
    }, 280)
  }

  function fotoPointerLeave() {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current)
    if (isPressRef.current) { isPressRef.current = false; setPausado(false) }
  }

  function btnProps(onClick: () => void) {
    return {
      onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
      onPointerUp: (e: React.PointerEvent) => e.stopPropagation(),
      onClick,
    }
  }

  async function compartilhar() {
    if (navigator.share) await navigator.share({ title: 'Eternizar', url: window.location.href })
    else navigator.clipboard.writeText(window.location.href)
  }

  if (!aberto || fotos.length === 0) return null
  const foto = fotos[atual]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.97)' }}>

        {/* Close button — top right, elegant */}
        <button className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
          {...btnProps(onFechar)}>
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Desktop arrows */}
        <button disabled={atual === 0}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm hidden md:flex items-center justify-center disabled:opacity-0 hover:bg-white/15 transition z-50"
          {...btnProps(() => irPara(atual - 1))}>
          <ChevronLeft className="w-6 h-6 text-white/70" />
        </button>
        <button disabled={atual === fotos.length - 1}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm hidden md:flex items-center justify-center disabled:opacity-0 hover:bg-white/15 transition z-50"
          {...btnProps(() => irPara(atual + 1))}>
          <ChevronRight className="w-6 h-6 text-white/70" />
        </button>

        {/* Photo container */}
        <div className="relative w-full max-w-lg h-full max-h-[85vh] mx-4 rounded-2xl overflow-hidden select-none"
          style={{ touchAction: 'none' }}>

          {/* Touch area */}
          <div className="absolute inset-0 z-10"
            onPointerDown={fotoPointerDown}
            onPointerUp={fotoPointerUp}
            onPointerLeave={fotoPointerLeave} />

          {/* Photo */}
          <AnimatePresence mode="wait">
            <motion.div key={atual}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.url} alt={foto.legenda || `Foto ${atual + 1}`}
                className="w-full h-full object-cover" draggable={false} />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 65%, rgba(0,0,0,0.85) 100%)' }} />
            </motion.div>
          </AnimatePresence>

          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 flex gap-1 px-3 pt-3 z-20">
            {fotos.map((_, i) => (
              <div key={i} className="flex-1 h-[2px] rounded-full overflow-hidden bg-white/25">
                <div className="h-full rounded-full transition-none"
                  style={{
                    width: i < atual ? '100%' : i === atual ? `${progresso}%` : '0%',
                    background: 'white',
                  }} />
              </div>
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-5 left-4 z-30">
            <span className="text-white/60 text-xs font-medium">{atual + 1} / {fotos.length}</span>
          </div>

          {/* Heart animation */}
          <AnimatePresence>
            {mostrarCoracao && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.3, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <Heart className="w-20 h-20 fill-current"
                  style={{ color: cor, filter: `drop-shadow(0 0 30px ${cor})` }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Caption */}
          {foto.legenda && (
            <motion.div key={`leg-${atual}`}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="absolute bottom-20 left-0 right-0 px-6 z-30 pointer-events-none">
              <p className="text-white text-base font-medium leading-relaxed drop-shadow-lg">{foto.legenda}</p>
            </motion.div>
          )}

          {/* Bottom actions */}
          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-4 z-30">
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
              {...btnProps(() => {
                setCurtido(prev => { const n = new Set(prev); n.has(atual) ? n.delete(atual) : n.add(atual); return n })
              })}>
              <Heart className={`w-5 h-5 ${curtido.has(atual) ? 'fill-current' : ''}`}
                style={{ color: curtido.has(atual) ? cor : 'rgba(255,255,255,0.7)' }} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
              {...btnProps(compartilhar)}>
              <Share2 className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
