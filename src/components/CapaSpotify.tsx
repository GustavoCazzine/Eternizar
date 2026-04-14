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

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, corHex)
    grad.addColorStop(0.6, corHex + '80')
    grad.addColorStop(1, '#121212')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const padding = 80
    const imgSize = canvas.width - padding * 2
    const imgY = 120

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
          ctx.save()
          roundRect(ctx, padding, imgY, imgSize, imgSize, 24)
          ctx.clip()
          const ratio = Math.max(imgSize / img.width, imgSize / img.height)
          const w = img.width * ratio
          const h = img.height * ratio
          ctx.drawImage(img, padding + (imgSize - w) / 2, imgY + (imgSize - h) / 2, w, h)
          ctx.restore()
          ctx.strokeStyle = 'rgba(0,0,0,0.4)'
          ctx.lineWidth = 2
          roundRect(ctx, padding, imgY, imgSize, imgSize, 24)
          ctx.stroke()
        }
      } catch {}
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      roundRect(ctx, padding, imgY, imgSize, imgSize, 24)
      ctx.fill()
    }

    const textY = imgY + imgSize + 90
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '600 28px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('ÃLBUM', padding, textY)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif'
    const tituloFinal = titulo.length > 24 ? titulo.slice(0, 22) + '...' : titulo
    ctx.fillText(tituloFinal, padding, textY + 70)

    if (subtitulo) {
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.font = '36px system-ui, -apple-system, sans-serif'
      const subFinal = subtitulo.length > 40 ? subtitulo.slice(0, 38) + '...' : subtitulo
      ctx.fillText(subFinal, padding, textY + 125)
    }

    const badgeY = canvas.height - 100
    ctx.beginPath()
    ctx.arc(padding + 24, badgeY, 24, 0, Math.PI * 2)
    ctx.fillStyle = '#1db954'
    ctx.fill()
    ctx.fillStyle = '#000'
    ctx.font = 'bold 24px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('â–¶', padding + 24, badgeY + 8)

    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '600 28px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('Eternizar âœ¨', padding + 60, badgeY + 10)

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
    const link = document.createElement('a')
    link.download = `eternizar-spotify.png`
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
      <button onClick={baixar} disabled={!gerado}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition disabled:opacity-40"
        style={{ background: `${corHex}20`, color: corHex, border: `1px solid ${corHex}40` }}>
        <Download className="w-4 h-4" />
        Baixar PNG
      </button>
      <p className="text-xs text-gray-600 text-center">Estilo Spotify Album (1080Ã—1080)</p>
    </div>
  )
}
