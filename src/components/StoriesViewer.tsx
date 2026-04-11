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
  // true enquanto está num "long press" ativo
  const isPressRef = useRef(false)
  // flag: este pointerUp deve ser ignorado (veio de um botão)
  const ignorarUpRef = useRef(false)
  // Swipe tracking
  const swipeStartX = useRef(0)
  const swipeStartY = useRef(0)
  const isSwiping = useRef(false)
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const irPara = useCallback((idx: number) => {
    if (idx < 0 || idx >= fotos.length) { onFechar(); return }
    setAtual(idx)
    setProgresso(0)
    progressoRef.current = 0
  }, [fotos.length, onFechar])

  // Tick do progresso
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

  // Reset ao abrir
  useEffect(() => {
    if (aberto) {
      setAtual(indiceInicial); setProgresso(0)
      progressoRef.current = 0; setPausado(false)
    }
  }, [aberto, indiceInicial])

  // ── Área da foto: segurar pausa, toque navega, duplo toque curte ──────────


  function fotoPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isPressRef.current = false
    isSwiping.current = false
    swipeStartX.current = e.clientX
    swipeStartY.current = e.clientY
    pressTimerRef.current = setTimeout(() => {
      isPressRef.current = true
      setPausado(true)
    }, 150)
  }

  function fotoPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current)

    if (isPressRef.current) {
      isPressRef.current = false
      setPausado(false)
      return
    }

    // Detectar swipe horizontal (>50px)
    const dx = e.clientX - swipeStartX.current
    const dy = e.clientY - swipeStartY.current
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) irPara(atual + 1)
      else irPara(atual - 1)
      return
    }

    const agora = Date.now()
    const clientX = e.clientX
    const rect = e.currentTarget.getBoundingClientRect()

    // Duplo toque = curtir (segundo toque dentro de 300ms)
    if (agora - lastTapRef.current < 300) {
      // Cancelar navegação pendente do primeiro toque
      if (tapTimerRef.current) { clearTimeout(tapTimerRef.current); tapTimerRef.current = null }
      lastTapRef.current = 0
      setCurtido(prev => {
        const n = new Set(prev); n.has(atual) ? n.delete(atual) : n.add(atual); return n
      })
      setMostrarCoracao(true)
      setTimeout(() => setMostrarCoracao(false), 1000)
      return
    }

    // Primeiro toque: agendar navegação (espera 300ms pro possível segundo toque)
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
      onPointerUp:   (e: React.PointerEvent) => e.stopPropagation(),
      onClick,
    }
  }

  async function compartilhar() {
    if (navigator.share) await navigator.share({ title: 'Memória especial', url: window.location.href })
    else navigator.clipboard.writeText(window.location.href)
  }

  if (!aberto || fotos.length === 0) return null
  const foto = fotos[atual]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 40 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black">

        {/* Container principal */}
        <div className="relative w-full max-w-sm h-full max-h-[100dvh] overflow-hidden select-none"
          style={{ touchAction: 'none' }}>

          {/* ── Área de toque da foto (fundo) ── */}
          <div className="absolute inset-0 z-10"
            onPointerDown={fotoPointerDown}
            onPointerUp={fotoPointerUp}
            onPointerLeave={fotoPointerLeave}
          />

          {/* Foto */}
          <AnimatePresence mode="wait">
            <motion.div key={atual}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.url} alt={foto.legenda || `Foto ${atual + 1}`}
                className="w-full h-full object-cover" draggable={false} />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 25%, transparent 60%, rgba(0,0,0,0.85) 100%)' }} />
            </motion.div>
          </AnimatePresence>

          {/* Barras de progresso */}
          <div className="absolute top-0 left-0 right-0 flex gap-1 px-3 pt-3 z-20">
            {fotos.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/30">
                <div className="h-full rounded-full bg-white"
                  style={{ width: i < atual ? '100%' : i === atual ? `${progresso}%` : '0%' }} />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-4 pt-2 z-30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: cor }}>✨</div>
              <span className="text-white text-sm font-medium">{atual + 1} / {fotos.length}</span>
            </div>
            <button className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white"
              {...btnProps(onFechar)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Coração (duplo toque) */}
          <AnimatePresence>
            {mostrarCoracao && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }} animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }} transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <Heart className="w-24 h-24 fill-current"
                  style={{ color: cor, filter: `drop-shadow(0 0 20px ${cor})` }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legenda */}
          {foto.legenda && (
            <motion.div key={`leg-${atual}`}
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-24 left-0 right-0 px-5 z-30 pointer-events-none">
              <p className="text-white text-lg font-semibold leading-snug drop-shadow-lg">{foto.legenda}</p>
            </motion.div>
          )}

          {/* Botões de ação — z-30 para ficarem acima da área de toque */}
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-between px-5 z-30">
            {/* Navegação */}
            <div className="flex gap-3">
              <button disabled={atual === 0}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center disabled:opacity-30"
                {...btnProps(() => irPara(atual - 1))}>
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button disabled={atual === fotos.length - 1}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center disabled:opacity-30"
                {...btnProps(() => irPara(atual + 1))}>
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Curtir + Compartilhar */}
            <div className="flex gap-3">
              <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
                {...btnProps(() => {
                  setCurtido(prev => {
                    const n = new Set(prev); n.has(atual) ? n.delete(atual) : n.add(atual); return n
                  })
                })}>
                <motion.div animate={curtido.has(atual) ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
                  <Heart className={`w-5 h-5 ${curtido.has(atual) ? 'fill-current' : ''}`}
                    style={{ color: curtido.has(atual) ? cor : 'white' }} />
                </motion.div>
              </button>
              <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
                {...btnProps(compartilhar)}>
                <Share2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <p className="absolute bottom-2 left-0 right-0 text-center text-white/30 text-xs z-30 pointer-events-none">
            arraste para navegar · segure para pausar · duplo toque para curtir
          </p>
        </div>

        {/* Setas desktop fora do container */}
        <button disabled={atual === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur hidden md:flex items-center justify-center disabled:opacity-20 hover:bg-white/20 transition"
          {...btnProps(() => irPara(atual - 1))}>
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button disabled={atual === fotos.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur hidden md:flex items-center justify-center disabled:opacity-20 hover:bg-white/20 transition"
          {...btnProps(() => irPara(atual + 1))}>
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
