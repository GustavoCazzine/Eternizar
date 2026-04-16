'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Heart, Mail, ArrowRight } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useSearchParams } from 'next/navigation'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/painel'

  // Exibe mensagem quando o callback OAuth falha
  useEffect(() => {
    if (searchParams.get('erro') === 'auth') {
      setErro('Não foi possível concluir o login. Tente novamente.')
    }
  }, [searchParams])

  async function loginGoogle() {
    setCarregando(true)
    setErro('')
    const supabase = createSupabaseBrowser()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    })
    if (error) { setErro('Erro ao conectar com Google.'); setCarregando(false) }
  }

  async function loginEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErro('E-mail inválido.')
      return
    }
    setCarregando(true)
    setErro('')
    const supabase = createSupabaseBrowser()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    })
    if (error) { setErro('Erro ao enviar link.'); setCarregando(false) }
    else { setEnviado(true); setCarregando(false) }
  }

  return (
    <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full blur-[40px] md:blur-[80px] opacity-12 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ff2d78, transparent 70%)', top: '-10%', right: '-10%' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[40px] md:blur-[80px] opacity-8 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c850c0, transparent 70%)', bottom: '10%', left: '-5%' }} />

      {/* Partículas */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: 3 + (i % 3) * 2, height: 3 + (i % 3) * 2,
              background: `rgba(255,45,120,${0.15 + i * 0.06})`,
              left: `${10 + i * 18}%`, top: `${20 + ((i * 23) % 50)}%` }}
            animate={{ y: [-15, 15, -15], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6 }}
          />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/">
            <img src="/logo.png" alt="Eternizar" className="h-12 mx-auto mb-6" />
          </a>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Heart className="w-10 h-10 mx-auto fill-current text-[#ff2d78] mb-4"
              style={{ filter: 'drop-shadow(0 0 20px rgba(255,45,120,0.4))' }} />
          </motion.div>
          <h1 className="text-2xl font-bold mb-1">Entre na sua conta</h1>
          <p className="text-zinc-500 text-sm">Acesse suas homenagens e crie novas</p>
        </div>

        {enviado ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center p-6 rounded-2xl border border-white/8 bg-white/[0.02]">
            <Mail className="w-12 h-12 mx-auto text-[#ff2d78] mb-4" />
            <h2 className="text-lg font-bold mb-2">Link enviado!</h2>
            <p className="text-zinc-500 text-sm mb-4">
              Enviamos um link mágico para <span className="text-white">{email}</span>.
              Clique no link do e-mail para entrar.
            </p>
            <button onClick={() => setEnviado(false)}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition">
              Usar outro e-mail
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Google OAuth */}
            <button onClick={loginGoogle} disabled={carregando}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition disabled:opacity-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar com Google
            </button>

            {/* Separador */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-zinc-600">ou</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Magic Link */}
            <form onSubmit={loginEmail} className="space-y-3">
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (erro) setErro('') }}
                placeholder="seu@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff2d78]/50 transition text-sm"
              />
              <button type="submit" disabled={carregando}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #ff2d78, #ff2d78aa)' }}>
                {carregando ? 'Enviando...' : <>Enviar link mágico <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {erro && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center">{erro}</motion.p>
            )}

            <p className="text-[11px] text-zinc-700 text-center leading-relaxed">
              Ao entrar, você concorda com os Termos de Uso e a Política de Privacidade do Eternizar.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function EntrarPage() {
  return <Suspense><LoginContent /></Suspense>
}
