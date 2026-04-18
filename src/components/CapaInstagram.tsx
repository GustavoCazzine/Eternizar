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

export default function CapaInstagram({ titulo, subtitulo, corHex, fotoCapa, tipo }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gerado, setGerado] = useState(false)

  useEffect(() => { gerar() }, [titulo, subtitulo, corHex, fotoCapa])

  async function gerar() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1920

    let fotoImg: HTMLImageElement | null = null
    if (fotoCapa) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        const loaded = await new Promise<boolean>((res) => {
          img.onload = () => res(true)
          img.onerror = () => res(false)
          img.src = fotoCapa
        })
        if (loaded && img.width > 0) fotoImg = img
      } catch {}
    }

    // Full-bleed photo or gradient background
    if (fotoImg) {
      const ratio = Math.max(canvas.width / fotoImg.width, canvas.height / fotoImg.height)
      const w = fotoImg.width * ratio
      const h = fotoImg.height * ratio
      ctx.drawImage(fotoImg, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
    } else {
      const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.35, 0, canvas.width / 2, canvas.height / 2, canvas.height)
      grad.addColorStop(0, corHex + '50')
      grad.addColorStop(0.5, '#0a0a0f')
      grad.addColorStop(1, '#000000')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Strong gradient overlay — dark bottom for text
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, 'rgba(0,0,0,0.1)')
    grad.addColorStop(0.35, 'rgba(0,0,0,0.05)')
    grad.addColorStop(0.55, 'rgba(0,0,0,0.3)')
    grad.addColorStop(0.75, 'rgba(0,0,0,0.75)')
    grad.addColorStop(1, 'rgba(0,0,0,0.95)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Top accent line
    ctx.fillStyle = corHex
    ctx.fillRect(0, 0, canvas.width, 5)

    // Thin line above title
    ctx.strokeStyle = corHex
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 40, canvas.height * 0.66)
    ctx.lineTo(canvas.width / 2 + 40, canvas.height * 0.66)
    ctx.stroke()

    // Title — big, bold, centered
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 96px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.7)'
    ctx.shadowBlur = 30
    wrapText(ctx, titulo, canvas.width / 2, canvas.height * 0.72, canvas.width - 140, 115)

    // Subtitle
    ctx.shadowBlur = 0
    if (subtitulo) {
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.font = '44px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      wrapText(ctx, subtitulo, canvas.width / 2, canvas.height * 0.82, canvas.width - 180, 55)
    }

    // Bottom branding — minimal pill
    const brandY = canvas.height - 110
    const brandText = 'eternizar'
    ctx.font = '500 28px system-ui'
    const tw = ctx.measureText(brandText).width
    const pillW = tw + 48
    const pillX = (canvas.width - pillW) / 2

    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    roundRect(ctx, pillX, brandY - 18, pillW, 44, 22)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.textAlign = 'center'
    ctx.fillText(brandText, canvas.width / 2, brandY + 12)

    setGerado(true)
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
    try { canvas.toDataURL('image/png') } catch {
      alert('Erro ao baixar. Tente novamente.')
      return
    }
    const link = document.createElement('a')
    link.download = 'eternizar-story.png'
    link.href = canvas.toDataURL('image/png', 0.95)
    link.click()
  }

  return (
    <div className="space-y-4">
      <div className="relative mx-auto overflow-hidden rounded-2xl shadow-2xl" style={{ maxWidth: 180 }}>
        <canvas ref={canvasRef} className="w-full" style={{ display: 'block' }} />
        {!gerado && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: corHex }} />
          </div>
        )}
      </div>
      <button onClick={baixar} disabled={!gerado}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition disabled:opacity-40"
        style={{ background: `${corHex}20`, color: corHex, border: `1px solid ${corHex}40` }}>
        <Download className="w-4 h-4" />
        Baixar Story
      </button>
    </div>
  )
}
