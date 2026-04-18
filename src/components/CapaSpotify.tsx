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

export default function CapaSpotify({ titulo, subtitulo, corHex, fotoCapa }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gerado, setGerado] = useState(false)

  useEffect(() => { gerar() }, [titulo, subtitulo, corHex, fotoCapa])

  async function gerar() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1080

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

    // Background: blurred photo or gradient
    if (fotoImg) {
      const ratio = Math.max(canvas.width / fotoImg.width, canvas.height / fotoImg.height) * 1.3
      const w = fotoImg.width * ratio
      const h = fotoImg.height * ratio
      ctx.filter = 'blur(60px) brightness(0.4) saturate(1.4)'
      ctx.drawImage(fotoImg, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
      ctx.filter = 'none'
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      grad.addColorStop(0, '#282828')
      grad.addColorStop(1, '#121212')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Dark overlay for readability
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Album art - centered square
    const imgSize = 560
    const imgX = (canvas.width - imgSize) / 2
    const imgY = 100

    if (fotoImg) {
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 50
      ctx.shadowOffsetY = 15
      roundRect(ctx, imgX, imgY, imgSize, imgSize, 12)
      ctx.clip()
      const ratio = Math.max(imgSize / fotoImg.width, imgSize / fotoImg.height)
      const w = fotoImg.width * ratio
      const h = fotoImg.height * ratio
      ctx.drawImage(fotoImg, imgX + (imgSize - w) / 2, imgY + (imgSize - h) / 2, w, h)
      ctx.restore()
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      roundRect(ctx, imgX, imgY, imgSize, imgSize, 12)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.font = '160px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('\u2665', canvas.width / 2, imgY + imgSize / 2 + 55)
    }

    // Title
    const textY = imgY + imgSize + 70
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 52px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    const pad = 90
    const tituloFinal = titulo.length > 30 ? titulo.slice(0, 28) + '...' : titulo
    ctx.fillText(tituloFinal, pad, textY)

    // Subtitle
    if (subtitulo) {
      ctx.fillStyle = 'rgba(255,255,255,0.65)'
      ctx.font = '32px system-ui, -apple-system, sans-serif'
      const subFinal = subtitulo.length > 50 ? subtitulo.slice(0, 48) + '...' : subtitulo
      ctx.fillText(subFinal, pad, textY + 48)
    }

    // Progress bar
    const barY = textY + 80
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    roundRect(ctx, pad, barY, canvas.width - pad * 2, 6, 3)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, pad, barY, (canvas.width - pad * 2) * 0.35, 6, 3)
    ctx.fill()

    // Time stamps
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '22px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('0:30', pad, barY + 30)
    ctx.textAlign = 'right'
    ctx.fillText('0:30', canvas.width - pad, barY + 30)

    // Controls row
    const ctrlY = barY + 70
    const cx = canvas.width / 2

    // Shuffle
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '28px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('\u21C4', cx - 180, ctrlY)

    // Prev
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('\u23EE', cx - 90, ctrlY)

    // Play button (big green circle)
    ctx.beginPath()
    ctx.arc(cx, ctrlY - 8, 36, 0, Math.PI * 2)
    ctx.fillStyle = '#1db954'
    ctx.fill()
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.moveTo(cx - 12, ctrlY - 26)
    ctx.lineTo(cx - 12, ctrlY + 10)
    ctx.lineTo(cx + 16, ctrlY - 8)
    ctx.closePath()
    ctx.fill()

    // Next
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '28px system-ui'
    ctx.fillText('\u23ED', cx + 90, ctrlY)

    // Repeat
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText('\u21BB', cx + 180, ctrlY)

    // Bottom branding
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '24px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('eternizar', canvas.width / 2, canvas.height - 40)

    setGerado(true)
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
    link.download = 'eternizar-spotify.png'
    link.href = canvas.toDataURL('image/png', 0.95)
    link.click()
  }

  return (
    <div className="space-y-4">
      <div className="relative mx-auto overflow-hidden rounded-2xl shadow-2xl" style={{ maxWidth: 220 }}>
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
        Baixar Spotify
      </button>
    </div>
  )
}
