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

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, corHex)
    grad.addColorStop(0.4, corHex + '99')
    grad.addColorStop(1, '#121212')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Noise overlay
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const padding = 80
    const imgSize = 580
    const imgX = (canvas.width - imgSize) / 2
    const imgY = 80

    // Album art (centered, smaller to leave room for text)
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
          // Shadow behind image
          ctx.shadowColor = 'rgba(0,0,0,0.5)'
          ctx.shadowBlur = 40
          ctx.shadowOffsetY = 10
          ctx.save()
          roundRect(ctx, imgX, imgY, imgSize, imgSize, 16)
          ctx.clip()
          const ratio = Math.max(imgSize / img.width, imgSize / img.height)
          const w = img.width * ratio
          const h = img.height * ratio
          ctx.drawImage(img, imgX + (imgSize - w) / 2, imgY + (imgSize - h) / 2, w, h)
          ctx.restore()
          ctx.shadowBlur = 0
          ctx.shadowOffsetY = 0
        }
      } catch {}
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      roundRect(ctx, imgX, imgY, imgSize, imgSize, 16)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.font = '120px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('\u2665', canvas.width / 2, imgY + imgSize / 2 + 40)
    }

    // Title
    const textY = imgY + imgSize + 60
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 10
    const tituloFinal = titulo.length > 28 ? titulo.slice(0, 26) + '...' : titulo
    ctx.fillText(tituloFinal, padding, textY)
    ctx.shadowBlur = 0

    // Subtitle
    if (subtitulo) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '34px system-ui, -apple-system, sans-serif'
      const subFinal = subtitulo.length > 45 ? subtitulo.slice(0, 43) + '...' : subtitulo
      ctx.fillText(subFinal, padding, textY + 50)
    }

    // Bottom bar - Spotify style
    const bottomY = canvas.height - 120

    // Green play button
    ctx.beginPath()
    ctx.arc(padding + 32, bottomY, 32, 0, Math.PI * 2)
    ctx.fillStyle = '#1db954'
    ctx.fill()

    // Play triangle
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.moveTo(padding + 22, bottomY - 16)
    ctx.lineTo(padding + 22, bottomY + 16)
    ctx.lineTo(padding + 48, bottomY)
    ctx.closePath()
    ctx.fill()

    // Heart icon
    ctx.fillStyle = '#1db954'
    ctx.font = '40px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('\u2665', padding + 100, bottomY + 14)

    // Branding
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '500 26px system-ui'
    ctx.textAlign = 'right'
    ctx.fillText('Eternizar', canvas.width - padding, bottomY + 10)

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
      alert('Erro de seguran\u00e7a ao baixar. Tente novamente.')
      return
    }
    const link = document.createElement('a')
    link.download = 'eternizar-spotify.png'
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
      <p className="text-xs text-gray-600 text-center">Estilo Spotify (1080x1080)</p>
    </div>
  )
}
