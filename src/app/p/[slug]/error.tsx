'use client'

// Error boundary específico da página do cliente (/p/[slug]).
// Evita que um bug aqui derrube toda a experiência; mostra fallback suave.

import { useEffect } from 'react'
import Link from 'next/link'
import { Heart, RefreshCw } from 'lucide-react'

export default function PaginaError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[PaginaClienteError]', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <Heart
          className="w-10 h-10 mx-auto fill-current text-[#9B1B30]/60 mb-5"
          style={{ filter: 'drop-shadow(0 0 20px rgba(155,27,48,0.3))' }}
        />
        <h1 className="text-xl font-bold mb-2">
          Não conseguimos abrir essa homenagem
        </h1>
        <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
          Pode ser um problema temporário. Tente recarregar em instantes.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #9B1B30, #9B1B30aa)' }}
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
