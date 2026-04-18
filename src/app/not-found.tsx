// Tela 404 branded do Eternizar.
// Capturada automaticamente quando qualquer rota chama notFound() ou
// quando o usuário acessa uma URL que não existe.

import Link from 'next/link'
import { Heart, Home, Plus } from 'lucide-react'

export default function NotFound() {
 return (
 <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center px-6 relative overflow-hidden">
 {/* Glow sutil */}
 <div
 className="absolute w-[180px] h-[180px] md:w-[350px] md:h-[350px] rounded-full blur-[40px] md:blur-[80px] opacity-10 pointer-events-none"
 style={{
 background: 'radial-gradient(circle, #9B1B30, transparent 70%)',
 top: '15%',
 left: '30%',
 }}
 />

 <div className="relative z-10 max-w-md text-center">
 <div className="mb-6">
 <Heart
 className="w-12 h-12 mx-auto fill-current text-[#9B1B30]/70"
 style={{ filter: 'drop-shadow(0 0 20px rgba(155,27,48,0.3))' }}
 />
 </div>

 <p className="text-[11px] text-[#9B1B30] uppercase tracking-[0.3em] mb-3 font-medium">
 Erro 404
 </p>
 <h1 className="text-2xl sm:text-3xl font-bold mb-3">
 Essa página não existe
 </h1>
 <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
 O link pode estar errado, ou a página que você procura foi removida ou
 expirou. Mas todas as boas histórias merecem um novo começo.
 </p>

 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 <Link
 href="/"
 className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-zinc-300 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all"
 >
 <Home className="w-4 h-4" />
 Voltar ao início
 </Link>
 <Link
 href="/criar"
 className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
 style={{
 background: 'linear-gradient(135deg, #9B1B30, #9B1B30aa)',
 boxShadow: '0 8px 24px rgba(155,27,48,0.25)',
 }}
 >
 <Plus className="w-4 h-4" />
 Criar homenagem
 </Link>
 </div>
 </div>
 </div>
 )
}
