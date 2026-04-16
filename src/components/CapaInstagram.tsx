'use client'

import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'

interface Props {
  titulo: string
  subtitulo?: string
  corHex: string
  fotoCapa?: string | null
  tipo: string
}

const EMOJIS: Record<string, string> = {
  casal: '❤️', formatura: 'ðŸŽ“', homenagem: '⭐'
}

export default function CapaInstagram({ titulo, subtitulo, corHex, fotoCapa, tipo }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gerado, setGerado] = useState(false)

  useEffect(() => {
    gerarCapa()
  }, [titulo, subtitulo, corHex, fotoCapa])

  async function gerarCapa() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1920

    if (fotoCapa) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        const loaded = await new Promise<boolean>((res) => {
          img.onload = () => res(true)
          img.onerror = () => res(false)
          img.src = fotoCapa
        })

        if (loaded && img.width > 0) {
          const ratio = Math.max(canvas.width / img.width, canvas.height / img.height)
          const w = img.width * ratio
          const h = img.height * ratio
          ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
        } else {
          desenharFundo(ctx, canvas, corHex)
        }
      } catch {
        desenharFundo(ctx, canvas, corHex)
      }
    } else {
      desenharFundo(ctx, canvas, corHex)
    }

    // Overlay escuro
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, 'rgba(0,0,0,0.3)')
    grad.addColorStop(0.4, 'rgba(0,0,0,0.2)')
    grad.addColorStop(0.7, 'rgba(0,0,0,0.7)')
    grad.addColorStop(1, 'rgba(0,0,0,0.92)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Linha colorida no topo
    ctx.fillStyle = corHex
    ctx.fillRect(0, 0, canvas.width, 6)

    // Emoji do tipo
    ctx.font = '140px serif'
    ctx.textAlign = 'center'
    ctx.fillText(EMOJIS[tipo] || '✨', canvas.width / 2, canvas.height * 0.62)

    // Título
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 90px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 20
    wrapText(ctx, titulo, canvas.width / 2, canvas.height * 0.72, canvas.width - 120, 110)

    // Linha decorativa
    ctx.shadowBlur = 0
    ctx.strokeStyle = corHex
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 60, canvas.height * 0.80)
    ctx.lineTo(canvas.width / 2 + 60, canvas.height * 0.80)
    ctx.stroke()

    // Subtítulo
    if (subtitulo) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '46px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      wrapText(ctx, subtitulo, canvas.width / 2, canvas.height * 0.84, canvas.width - 160, 56)
    }

    // Badge Eternizar
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    roundRect(ctx, canvas.width / 2 - 140, canvas.height * 0.91, 280, 60, 30)
    ctx.fill()
    ctx.fillStyle = corHex
    ctx.font = 'bold 32px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Criado com Eternizar ✨', canvas.width / 2, canvas.height * 0.91 + 40)

    setGerado(true)
  }

  function desenharFundo(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, cor: string) {
    const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.3, 0, canvas.width / 2, canvas.height / 2, canvas.height)
    grad.addColorStop(0, cor + '40')
    grad.addColorStop(0.5, '#08080c')
    grad.addColorStop(1, '#000000')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ')
    let line = ''
    let currentY = y
    for (const word of words) {
      const test = line + word + ' '
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line.trim(), x, currentY)
        line = word + ' '
        currentY += lineHeight
      } else {
        line = test
      }
    }
    ctx.fillText(line.trim(), x, currentY)
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  function baixar() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `eternizar-capa.png`
    link.href = canvas.toDataURL('image/png', 0.95)
    link.click()
  }

  return (
    <div className="space-y-4">
      <div className="relative mx-auto overflow-hidden rounded-2xl shadow-2xl" style={{ maxWidth: 200 }}>
        <canvas ref={canvasRef} className="w-full" style={{ display: 'block' }} />
        {!gerado && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: corHex }} />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={baixar} disabled={!gerado}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition disabled:opacity-40"
          style={{ background: `${corHex}20`, color: corHex, border: `1px solid ${corHex}40` }}>
          <Download className="w-4 h-4" />
          Baixar PNG
        </button>
        <a href="https://www.instagram.com/stories/create" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-gray-400 hover:text-white transition">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
          Postar
        </a>
      </div>

      <p className="text-xs text-gray-600 text-center">
        Tamanho ideal para Instagram Stories (1080×1920)
      </p>
    </div>
  )
}
