'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { LayoutDashboard, LogIn } from 'lucide-react'

interface SessionUser {
 id: string
 email: string
 nome: string
 avatar: string
}

interface Props {
 /**
 * Visual variant:
 * - 'navbar' → landing page (translúcido, rounded-full)
 * - 'header' → wizard/sucesso (compacto, sem background)
 */
 variant?: 'navbar' | 'header'
 /** Mostra só o ícone em telas pequenas (default: true pra navbar, false pra header) */
 iconOnlyMobile?: boolean
}

// ─── Botão de Login/Painel — detecta sessão no client ─────────────
// Mostra "Entrar" quando deslogado e avatar + "Meu painel" quando logado.
// Evita flash-of-wrong-content usando estado `carregando`.
export default function AuthButton({ variant = 'navbar', iconOnlyMobile = true }: Props) {
 const [user, setUser] = useState<SessionUser | null>(null)
 const [carregando, setCarregando] = useState(true)

 useEffect(() => {
 const supabase = createSupabaseBrowser()
 let ativo = true

 supabase.auth.getUser().then(({ data }) => {
 if (!ativo) return
 if (data.user) {
 setUser({
 id: data.user.id,
 email: data.user.email || '',
 nome: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
 avatar: data.user.user_metadata?.avatar_url || '',
 })
 }
 setCarregando(false)
 })

 // Atualiza em tempo real se o usuário logar/deslogar em outra aba
 const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
 if (!ativo) return
 if (session?.user) {
 setUser({
 id: session.user.id,
 email: session.user.email || '',
 nome: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
 avatar: session.user.user_metadata?.avatar_url || '',
 })
 } else {
 setUser(null)
 }
 })

 return () => {
 ativo = false
 sub.subscription.unsubscribe()
 }
 }, [])

 // Enquanto carrega, renderiza um placeholder invisível do mesmo tamanho
 // pra evitar layout shift. Usa aria-hidden pra não ser lido por screen readers.
 if (carregando) {
 return (
 <div
 aria-hidden="true"
 className={variant === 'navbar' ? 'w-20 h-9' : 'w-9 h-9'}
 />
 )
 }

 // ─── Deslogado: link "Entrar" ─────────────────────────────────
 if (!user) {
 if (variant === 'navbar') {
 return (
 <Link
 href="/entrar"
 className="text-zinc-400 hover:text-white text-sm transition-colors"
 >
 Entrar
 </Link>
 )
 }
 return (
 <Link
 href="/entrar"
 className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition"
 title="Entrar na conta"
 >
 <LogIn className="w-4 h-4" />
 <span className={iconOnlyMobile ? 'hidden sm:inline' : ''}>Entrar</span>
 </Link>
 )
 }

 // ─── Logado: avatar + link para /painel ───────────────────────
 const inicial = (user.nome || user.email || '?')[0].toUpperCase()

 if (variant === 'navbar') {
 return (
 <Link
 href="/painel"
 className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all"
 title={user.email}
 >
 {user.avatar ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={user.avatar}
 alt=""
 className="w-6 h-6 rounded-full border border-white/10"
 referrerPolicy="no-referrer"
 />
 ) : (
 <div className="w-6 h-6 rounded-full bg-[#9B1B30]/20 flex items-center justify-center text-[11px] font-bold text-[#9B1B30]">
 {inicial}
 </div>
 )}
 <span className="text-xs font-medium text-white hidden sm:inline">Meu painel</span>
 </Link>
 )
 }

 // variant = 'header' — compacto
 return (
 <Link
 href="/painel"
 className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition"
 title={`${user.email} — Meu painel`}
 >
 {user.avatar ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={user.avatar}
 alt=""
 className="w-7 h-7 rounded-full border border-white/10"
 referrerPolicy="no-referrer"
 />
 ) : (
 <div className="w-7 h-7 rounded-full bg-[#9B1B30]/20 flex items-center justify-center text-[11px] font-bold text-[#9B1B30]">
 {inicial}
 </div>
 )}
 <span className={iconOnlyMobile ? 'hidden sm:flex items-center gap-1' : 'flex items-center gap-1'}>
 <LayoutDashboard className="w-3.5 h-3.5" />
 Painel
 </span>
 </Link>
 )
}
