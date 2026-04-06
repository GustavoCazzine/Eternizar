'use client'

// ⚠️ DESATIVADO — fluxo de pagamento Mercado Pago não está em uso.
// A plataforma foi convertida pra free; criação acontece direto em /criar.
//
// Esta rota é mantida apenas pra capturar usuários que cheguem aqui via
// link antigo (e-mail, bookmark) e redirecioná-los educadamente.
//
// O código original do checkout Pix está no histórico do git — basta
// reverter este arquivo quando a monetização for reativada.

import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'

export default function PagamentoDesativado() {
  return (
    <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <Heart
          className="w-12 h-12 mx-auto fill-current text-[#ff2d78] mb-6"
          style={{ filter: 'drop-shadow(0 0 20px rgba(255,45,120,0.4))' }}
        />
        <h1 className="text-2xl font-bold mb-3">Eternizar agora é gratuito</h1>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
          Você pode criar sua homenagem sem pagar nada. Clique abaixo pra começar.
        </p>
        <Link
          href="/criar"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, #ff2d78, #ff2d78aa)',
            boxShadow: '0 8px 24px rgba(255,45,120,0.25)',
          }}
        >
          Criar minha homenagem
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
