'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, LogIn } from 'lucide-react'

export default function PainelError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[PainelError]', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-bold mb-2">Não foi possível carregar seu painel</h1>
        <p className="text-zinc-500 text-sm mb-6">
          Pode ser um problema temporário de conexão. Tente recarregar ou entrar novamente.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #ff2d78, #ff2d78aa)' }}
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar
          </button>
          <Link
            href="/entrar"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            <LogIn className="w-4 h-4" />
            Entrar novamente
          </Link>
        </div>
      </div>
    </div>
  )
}
