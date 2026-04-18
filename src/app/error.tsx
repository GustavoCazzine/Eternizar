'use client'

// Error boundary global do App Router.
// Capturado quando qualquer page.tsx ou server component dá throw não-tratado.
// Sem esse arquivo, o Next mostra a tela genérica do browser "This page couldn't load".

import { useEffect } from 'react'
import Link from 'next/link'
import { Heart, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
 error,
 reset,
}: {
 error: Error & { digest?: string }
 reset: () => void
}) {
 useEffect(() => {
 // Log estruturado pro Vercel capturar
 console.error('[GlobalError]', {
 message: error.message,
 digest: error.digest,
 stack: error.stack?.split('\n').slice(0, 5).join('\n'),
 })
 }, [error])

 return (
 <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center px-6 relative overflow-hidden">
 {/* Glow sutil */}
 <div
 className="absolute w-[180px] h-[180px] md:w-[350px] md:h-[350px] rounded-full blur-[40px] md:blur-[80px] opacity-10 pointer-events-none"
 style={{
 background: 'radial-gradient(circle, #9B1B30, transparent 70%)',
 top: '20%',
 left: '30%',
 }}
 />

 <div className="relative z-10 max-w-md text-center">
 <div className="mb-6">
 <Heart
 className="w-12 h-12 mx-auto fill-current text-[#9B1B30]"
 style={{ filter: 'drop-shadow(0 0 20px rgba(155,27,48,0.4))' }}
 />
 </div>

 <h1 className="text-2xl sm:text-3xl font-bold mb-3">
 Algo deu errado do nosso lado
 </h1>
 <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
 Tivemos um problema ao carregar essa página. Você pode tentar de novo ou
 voltar ao início. Já fomos notificados.
 </p>

 {/* Código do erro (pra suporte) — só mostra se tem digest */}
 {error.digest && (
 <p className="text-[11px] text-zinc-700 font-mono mb-6">
 ref: {error.digest}
 </p>
 )}

 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 <button
 onClick={reset}
 className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
 style={{
 background: 'linear-gradient(135deg, #9B1B30, #9B1B30aa)',
 boxShadow: '0 8px 24px rgba(155,27,48,0.25)',
 }}
 >
 <RefreshCw className="w-4 h-4" />
 Tentar novamente
 </button>

 <Link
 href="/"
 className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-zinc-300 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all"
 >
 <Home className="w-4 h-4" />
 Voltar ao início
 </Link>
 </div>
 </div>
 </div>
 )
}
