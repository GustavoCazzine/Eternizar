'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, Share2, ArrowRight } from 'lucide-react'
import CapaInstagram from '@/components/CapaInstagram'
import CapaSpotify from '@/components/CapaSpotify'
import AuthButton from '@/components/AuthButton'

// â”€â”€â”€ Glow Orbs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GlowOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[40px] md:blur-[70px] opacity-15"
        style={{ background: 'radial-gradient(circle, #ff2d78, transparent 70%)', top: '-10%', right: '-5%' }}
      />
    </div>
  )
}

// â”€â”€â”€ Floating Hearts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”€â”€â”€ Partículas premium â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Particulas() { return null }

// â”€â”€â”€ Phone Mockup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PhoneMockup({ titulo, subtitulo, corTema, fotoCapa }: {
  titulo: string; subtitulo: string; corTema: string; fotoCapa?: string
}) {
  const accentColor = corTema || '#ff2d78'

  return (
    <motion.div
      initial={{ opacity: 0, x: -40, rotate: -8 }}
      animate={{ opacity: 1, x: 0, rotate: -6 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative"
    >
      <div className="relative w-[180px] h-[360px] sm:w-[200px] sm:h-[400px] lg:w-[220px] lg:h-[440px] rounded-[40px] bg-gradient-to-b from-zinc-700 to-zinc-900 p-[3px] shadow-2xl shadow-black/60">
        <div className="w-full h-full rounded-[37px] bg-black overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-b-2xl z-20" />
          <div
            className="w-full h-full flex flex-col items-center justify-center p-5 text-center"
            style={{
              background: fotoCapa
                ? `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.9)), url(${fotoCapa}) center/cover`
                : `linear-gradient(to bottom, ${accentColor}22, #0a0a0f)`,
            }}
          >
            <div
              className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-4xl"
              style={{ background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}15)`, border: `2px solid ${accentColor}50` }}
            >
              ’‘
            </div>
            <p className="text-white font-bold text-base">{titulo}</p>
            <p className="text-pink-300/80 text-[11px] mt-1 max-w-[180px]">{subtitulo}</p>
            <div className="mt-5 w-full space-y-2">
              {[0.7, 0.5, 0.6].map((w, i) => (
                <div key={i} className="h-[6px] rounded-full mx-auto" style={{ width: `${w * 100}%`, background: `${accentColor}${i === 0 ? '30' : '15'}` }} />
              ))}
            </div>
            <div className="mt-4 flex gap-3 items-center">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm" style={{ background: `${accentColor}20` }}></div>
              <div className="text-left">
                <div className="text-white text-[10px] font-medium">Tocando agora</div>
                <div className="text-zinc-500 text-[9px]">  </div>
              </div>
            </div>
            {['♥', '', '✨'].map((e, i) => (
              <motion.div
                key={i}
                className="absolute text-sm"
                style={{ bottom: `${20 + i * 15}%`, left: `${10 + i * 25}%`, opacity: 0.5 }}
              >
                {e}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// â”€â”€â”€ Stat Box â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-white text-xl font-bold">{value}</div>
      <div className="text-zinc-500 text-xs mt-1">{label}</div>
    </div>
  )
}

// =====
// â”€â”€â”€ SUCCESS CONTENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// =====
function SucessoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const slug = searchParams.get('slug') || ''
  const cor = searchParams.get('cor') || 'pink'
  const titulo = searchParams.get('titulo') || 'Sua página'
  const subtitulo = searchParams.get('subtitulo') || ''
  const tipo = searchParams.get('tipo') || 'casal'
  const fotoCapa = searchParams.get('fotoCapa') || ''

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copiado, setCopiado] = useState(false)
  const [qrGerado, setQrGerado] = useState(false)
  const [showCapa, setShowCapa] = useState(false)
  const [hospedagemAtiva, setHospedagemAtiva] = useState(false)
  const [hospedagemLoading, setHospedagemLoading] = useState(false)

  const [url, setUrl] = useState(`/p/${slug}`)
  useEffect(() => {
    setUrl(`${window.location.origin}/p/${slug}`)
  }, [slug])

  // Map old color names to hex
  const coresMap: Record<string, string> = {
    pink: '#ff2d78', violet: '#8b5cf6', amber: '#f59e0b',
    blue: '#3b82f6', emerald: '#10b981', rose: '#f43f5e',
  }
  const corHex = coresMap[cor] || (cor.startsWith('#') ? cor : '#ff2d78')
  const displayUrl = `eternizar.io/homenagem/${slug}`

  useEffect(() => {
    if (!slug) return
    gerarQRCode()
  }, [slug, cor, url])

  async function gerarQRCode() {
    const QRCode = (await import('qrcode')).default
    const canvas = canvasRef.current
    if (!canvas) return

    await QRCode.toCanvas(canvas, url, {
      width: 200,
      margin: 2,
      color: {
        dark: corHex,
        light: '#00000000', // transparent background
      },
    })

    setQrGerado(true)

  }

  async function ativarHospedagem() {
    if (hospedagemAtiva || hospedagemLoading) return
    setHospedagemLoading(true)
    try {
      const res = await fetch('/api/hospedagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })
      const data = await res.json()
      if (res.ok && data.sucesso) {
        setHospedagemAtiva(true)
      } else {
        alert(data.erro || 'Erro ao ativar hospedagem')
      }
    } catch {
      alert('Erro de conexao')
    }
    setHospedagemLoading(false)
  }

  function copiarLink() {
    navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  function baixarQR(formato: 'png' | 'pdf') {
    const canvas = canvasRef.current
    if (!canvas) return

    if (formato === 'png') {
      const link = document.createElement('a')
      link.download = `eternizar-${slug}-qrcode.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      return
    }

    const dataUrl = canvas.toDataURL('image/png')
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>QR Code  ${titulo}</title>
          <style>
            body { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; margin:0; font-family:system-ui,sans-serif; background:#fff; gap:16px; }
            img { width:260px; height:260px; border-radius:16px; }
            h2 { margin:0; font-size:22px; color:#111; text-align:center; }
            p { margin:0; color:#888; font-size:13px; word-break:break-all; max-width:280px; text-align:center; }
            .badge { font-size:11px; color:#bbb; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="QR Code" />
          <h2>${titulo}</h2>
          <p>${url}</p>
          <span class="badge">Criado com Eternizar ✨</span>
          <script>setTimeout(()=>window.print(),500)<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  async function compartilhar() {
    if (navigator.share) {
      await navigator.share({ title: titulo, text: 'Tenho uma surpresa especial para voce!', url })
    } else {
      copiarLink()
    }
  }

  return (
    <main className="min-h-screen bg-[#08080c] text-white overflow-x-hidden relative">
      <GlowOrbs />
      <Particulas />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/"><img src="/logo.png" alt="Eternizar" className="h-11" /></a>
          <div className="flex items-center gap-6">
            <a href="/#como-funciona" className="text-zinc-400 hover:text-white text-sm transition-colors hidden md:inline">Como Funciona</a>
            <AuthButton variant="header" />
          </div>
        </div>
      </nav>

      <section className="relative z-10 min-h-screen lg:h-screen pt-16 pb-4 px-6 flex items-start lg:items-center">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
            {/* â”€â”€â”€ LEFT COLUMN â”€â”€â”€ */}
            <div className="flex flex-col items-center lg:items-start">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight mb-4 text-center lg:text-left"
              >
                Parabéns! Sua Homenagem{' '}
                <br className="hidden sm:block" />
                Está Online ✨
              </motion.h1>

              <div className="flex justify-center lg:justify-start">
                <PhoneMockup
                  titulo={titulo}
                  subtitulo={subtitulo}
                  corTema={corHex}
                  fotoCapa={fotoCapa || undefined}
                />
              </div>
            </div>

            {/* â”€â”€â”€ RIGHT COLUMN â”€â”€â”€ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md mx-auto lg:mx-0"
            >
              {/* Sharing Actions Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6">
                <h2 className="text-lg font-bold mb-6 text-center">Ações de Compartilhamento</h2>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="relative p-4 rounded-2xl border-2" style={{ borderColor: `${corHex}40` }}>
                    {/* Corner decorations */}
                    {[
                      'top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl',
                      'top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl',
                      'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl',
                      'bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl',
                    ].map((pos, i) => (
                      <div key={i} className={`absolute w-6 h-6 ${pos}`} style={{ borderColor: corHex }} />
                    ))}

                    <canvas ref={canvasRef} className="block rounded-xl" style={{ width: 120, height: 120 }} />


                    {!qrGerado && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: corHex }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Link */}
                <div className="mb-4">
                  <label className="text-zinc-500 text-xs mb-1.5 block">Seu Link Exclusivo:</label>
                  <div className="flex items-center bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3">
                    <span className="text-zinc-300 text-sm truncate flex-1 font-mono">{displayUrl}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mb-3">
                  <button
                    onClick={copiarLink}
                    className="w-full py-2.5 rounded-xl border border-white/15 bg-white/[0.04] text-white font-semibold text-sm hover:bg-white/[0.08] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {copiado ? (
                      <><span className="text-green-400">*</span> Link Copiado!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copiar Link</>
                    )}
                  </button>

                  <button
                    onClick={() => setShowCapa(!showCapa)}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                    style={{ background: `linear-gradient(135deg, ${corHex}, ${corHex}bb)` }}
                  >
                    Gerar Arte para Instagram Stories
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="18" cy="6" r="1.5" fill="currentColor" />
                    </svg>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => baixarQR('png')}
                      className="flex-1 py-3 rounded-xl border border-white/15 bg-white/[0.04] text-white font-semibold text-sm hover:bg-white/[0.08] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> PNG
                    </button>
                    <button
                      onClick={() => baixarQR('pdf')}
                      className="flex-1 py-3 rounded-xl border border-white/15 bg-white/[0.04] text-white font-semibold text-sm hover:bg-white/[0.08] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </button>
                    <button
                      onClick={compartilhar}
                      className="flex-1 py-3 rounded-xl border border-white/15 bg-white/[0.04] text-white font-semibold text-sm hover:bg-white/[0.08] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" /> Enviar
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-white/10 pt-5 mb-5">
                  <h3 className="text-zinc-400 text-xs font-semibold tracking-wider uppercase mb-4 text-center">
                    Visitas e Interações
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <StatBox value={0} label="Visitas hoje" />
                    <StatBox value={0} label="Curtidas" />
                    <StatBox value={0} label="Interações" />
                  </div>
                </div>

                {/* Expiry */}
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3 border"
                  style={{ borderColor: `${corHex}30`, background: `${corHex}08` }}
                >
                  <div>
                    <p className="text-zinc-400 text-xs">Sua Página Expira em</p>
                    <p className="text-white text-lg font-bold">{hospedagemAtiva ? "Para sempre" : "60 dias"}</p>
                  </div>
                  <button
                    onClick={ativarHospedagem}
                    disabled={hospedagemAtiva || hospedagemLoading}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                    style={{ background: hospedagemAtiva ? '#10b981' : `linear-gradient(135deg, ${corHex}, ${corHex}bb)` }}
                  >
                    {hospedagemAtiva ? "Ativa para sempre!" : hospedagemLoading ? "Ativando..." : "Ativar Hospedagem Vitalícia"}
                  </button>
                </div>
              </div>

              {/* View page link */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6">
                <button
                  onClick={() => router.push(`/p/${slug}`)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${corHex}, ${corHex}bb)`, boxShadow: `0 8px 32px ${corHex}40` }}
                >
                  Ver minha página <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* Instagram Cover Generator */}
          {showCapa && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex justify-center"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 max-w-2xl w-full">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: corHex }}>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  <h3 className="text-lg font-bold">Capas para compartilhar</h3>
                </div>
                <div className="flex flex-col items-center gap-8 sm:grid sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-zinc-500 text-center mb-2">Story (1080×1920)</p>
                    <CapaInstagram titulo={titulo} subtitulo={subtitulo} corHex={corHex} tipo={tipo} fotoCapa={fotoCapa || undefined} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 text-center mb-2">Spotify (1080×1080)</p>
                    <CapaSpotify titulo={titulo} subtitulo={subtitulo} corHex={corHex} tipo={tipo} fotoCapa={fotoCapa || undefined} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logo.png" alt="Eternizar" className="h-7 opacity-40" />
          <p className="text-zinc-600 text-xs">Criado com Eternizar ✨</p>
        </div>
      </footer>
    </main>
  )
}

export default function SucessoPage() {
  return (
    <Suspense>
      <SucessoContent />
    </Suspense>
  )
}
