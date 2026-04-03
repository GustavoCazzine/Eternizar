'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Copy, Clock, RefreshCw, ArrowRight, Heart } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

interface DadosPix {
  qrCode: string
  qrCodeBase64: string
  valor: number
  expiraEm: string
  pedidoId: string
  slug?: string
}

// Partículas marca registrada
function Particulas({ cor = '#ff2d78' }: { cor?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: 3 + (i % 3) * 2, height: 3 + (i % 3) * 2, background: `${cor}${30 + i * 10}`,
            left: `${10 + i * 14}%`, top: `${15 + ((i * 19) % 55)}%` }}
          animate={{ y: [-15, 15, -15], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
    </div>
  )
}

export default function PagamentoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [pix, setPix] = useState<DadosPix | null>(null)
  const [status, setStatus] = useState<'carregando' | 'aguardando' | 'pago' | 'erro'>('carregando')
  const [copiado, setCopiado] = useState(false)
  const [slug, setSlug] = useState('')

  useEffect(() => { gerarPix() }, [id])

  useEffect(() => {
    if (status !== 'aguardando') return
    const interval = setInterval(verificarPagamento, 5000)
    return () => clearInterval(interval)
  }, [status])

  async function gerarPix() {
    try {
      const res = await fetch(`/api/pagamento/gerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidoId: id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro)
      setPix(data)
      setSlug(data.slug || '')
      setStatus('aguardando')
    } catch { setStatus('erro') }
  }

  async function verificarPagamento() {
    try {
      const res = await fetch(`/api/pagamento/status?pedidoId=${id}`)
      const data = await res.json()
      if (data.status === 'pago') { setStatus('pago'); setSlug(data.slug) }
    } catch { /* silencioso */ }
  }

  function copiarPix() {
    if (!pix?.qrCode) return
    navigator.clipboard.writeText(pix.qrCode)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  // ─── Loading ─────────────────────────────────────────
  if (status === 'carregando') {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <RefreshCw className="w-6 h-6 text-[#ff2d78]" />
        </motion.div>
      </div>
    )
  }

  // ─── Pago com sucesso ────────────────────────────────
  if (status === 'pago') {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center px-4 relative overflow-hidden">
        <Particulas cor="#10b981" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-15"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)', top: '20%', left: '30%' }} />

        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="text-center max-w-md relative z-10"
        >
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: 3, duration: 0.5 }}>
            <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-3">Pagamento confirmado!</h1>
          <p className="text-zinc-500 mb-8 text-sm">Sua página foi criada. Compartilhe o link com quem você ama.</p>

          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl mb-6 flex items-center gap-3">
            <span className="text-zinc-400 text-sm flex-1 truncate font-mono">
              {typeof window !== 'undefined' ? window.location.origin : ''}/p/{slug}
            </span>
            <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: '#10b981' }}>
              Copiar
            </button>
          </div>

          <button onClick={() => router.push(`/sucesso?slug=${slug}`)}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #10b981, #10b981aa)' }}>
            Ver minha página <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    )
  }

  // ─── Erro ────────────────────────────────────────────
  if (status === 'erro') {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center px-4 text-center relative overflow-hidden">
        <Particulas cor="#f43f5e" />
        <div className="relative z-10">
          <h1 className="text-xl font-bold mb-3 text-red-400">Erro ao gerar pagamento</h1>
          <p className="text-zinc-500 text-sm mb-6">Tente novamente ou entre em contato.</p>
          <button onClick={gerarPix} className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #ff2d78, #ff2d78aa)' }}>
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  // ─── Aguardando pagamento ────────────────────────────
  return (
    <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute w-[600px] h-[600px] rounded-full blur-[180px] opacity-12 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ff2d78, transparent 70%)', top: '-10%', right: '-10%' }} />
      <Particulas />

      <div className="max-w-md w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="text-center mb-8">
            <a href="/" className="inline-block mb-6">
              <img src="/logo.png" alt="Eternizar" className="h-10 mx-auto opacity-60" />
            </a>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="mb-4">
              <Heart className="w-10 h-10 mx-auto fill-current text-[#ff2d78]" style={{ filter: 'drop-shadow(0 0 20px rgba(255,45,120,0.4))' }} />
            </motion.div>
            <h1 className="text-2xl font-bold mb-1">Finalize sua homenagem</h1>
            <p className="text-zinc-500 text-sm">Escaneie o QR Code ou copie o código Pix</p>
          </div>

          {/* Card principal */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 mb-4">

            {/* QR Code */}
            <div className="bg-white rounded-xl p-4 mb-5 flex items-center justify-center mx-auto w-fit">
              {pix?.qrCodeBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`data:image/png;base64,${pix.qrCodeBase64}`} alt="QR Code Pix" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-lg animate-pulse" />
              )}
            </div>

            {/* Valor — discreto */}
            <div className="text-center mb-5">
              <p className="text-zinc-600 text-xs uppercase tracking-widest mb-1">Valor</p>
              <p className="text-2xl font-bold text-white">R$ {pix?.valor}<span className="text-zinc-600">,00</span></p>
            </div>

            {/* Pix copia e cola */}
            <button onClick={copiarPix}
              className="w-full p-3.5 bg-white/[0.03] border border-white/10 rounded-xl flex items-center gap-3 hover:border-white/20 transition"
            >
              <div className="flex-1 text-left min-w-0">
                <p className="text-[11px] text-zinc-600 mb-0.5">Pix copia e cola</p>
                <p className="text-xs text-zinc-400 truncate font-mono">{pix?.qrCode?.slice(0, 40)}...</p>
              </div>
              <div className={`p-2 rounded-lg text-white transition text-xs font-semibold ${copiado ? 'bg-emerald-500' : 'bg-white/10'}`}>
                {copiado ? '✓' : <Copy className="w-4 h-4" />}
              </div>
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-zinc-600 text-xs">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}>
              <Clock className="w-3.5 h-3.5" />
            </motion.div>
            <span>Aguardando pagamento...</span>
          </div>

          <p className="text-[11px] text-zinc-700 text-center mt-3">
            Após o pagamento, sua página será ativada automaticamente.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
