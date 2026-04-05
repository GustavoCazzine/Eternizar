'use client'

import { motion } from 'framer-motion'
import { Heart, Plus, Eye, Calendar, ExternalLink, LogOut, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Pagina {
  slug: string; tipo: string; titulo: string; subtitulo: string
  cor_tema: string; ativa: boolean; visualizacoes: number
  created_at: string; hospedagem_vitalicia: boolean; expira_em: string | null
  fotos: Array<{ url: string; isCapa?: boolean }>
}

interface User { id: string; email: string; nome: string; avatar: string }

const coresMap: Record<string, string> = {
  pink: '#ec4899', violet: '#8b5cf6', amber: '#f59e0b',
  blue: '#3b82f6', emerald: '#10b981', rose: '#f43f5e',
}

function diasRestantes(expira_em: string | null, vitalicia: boolean): string {
  if (vitalicia) return 'Permanente'
  if (!expira_em) return '—'
  const dias = Math.ceil((new Date(expira_em).getTime() - Date.now()) / 86400000)
  if (dias < 0) return 'Expirada'
  if (dias === 0) return 'Expira hoje'
  return `${dias} dias`
}

export default function PainelCliente({ user, paginas }: { user: User; paginas: Pagina[] }) {
  const cor = '#ff2d78'

  return (
    <div className="min-h-screen bg-[#08080c] text-white relative overflow-hidden">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[180px] opacity-10"
          style={{ background: 'radial-gradient(circle, #ff2d78, transparent 70%)', top: '-5%', right: '-5%' }} />
      </div>

      {/* Partículas */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(4)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: 3 + i, height: 3 + i, background: `rgba(255,45,120,${0.1 + i * 0.05})`,
              left: `${15 + i * 20}%`, top: `${20 + i * 15}%` }}
            animate={{ y: [-12, 12, -12], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#08080c]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Eternizar" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white font-medium">{user.nome || user.email}</p>
              {user.nome && <p className="text-[11px] text-zinc-600">{user.email}</p>}
            </div>
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border border-white/10" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#ff2d78]/20 flex items-center justify-center text-xs font-bold text-[#ff2d78]">
                {(user.nome || user.email)[0].toUpperCase()}
              </div>
            )}
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-zinc-600 hover:text-zinc-400 transition p-1" title="Sair">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Minhas Homenagens</h1>
            <p className="text-zinc-500 text-sm mt-1">{paginas.length} página{paginas.length !== 1 ? 's' : ''} criada{paginas.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/criar"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${cor}, ${cor}aa)` }}>
            <Plus className="w-4 h-4" /> Nova
          </Link>
        </div>

        {paginas.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20">
            <Heart className="w-12 h-12 mx-auto text-zinc-800 mb-4" />
            <h2 className="text-lg font-bold text-zinc-400 mb-2">Nenhuma homenagem ainda</h2>
            <p className="text-zinc-600 text-sm mb-6">Crie sua primeira página e surpreenda alguém especial.</p>
            <Link href="/criar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${cor}, ${cor}aa)` }}>
              Criar homenagem <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {paginas.map((p, i) => {
              const corTema = coresMap[p.cor_tema] || cor
              const capa = p.fotos?.find((f: { isCapa?: boolean }) => f.isCapa)?.url
              const status = diasRestantes(p.expira_em, p.hospedagem_vitalicia)
              const expirada = status === 'Expirada'

              return (
                <motion.div key={p.slug}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition-all overflow-hidden ${expirada ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10"
                      style={{ background: capa ? undefined : `linear-gradient(135deg, ${corTema}20, ${corTema}05)` }}>
                      {capa ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={capa} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="w-5 h-5" style={{ color: corTema }} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm truncate nome-capitalize">{p.titulo}</h3>
                      {p.subtitulo && <p className="text-xs text-zinc-500 truncate nome-capitalize">{p.subtitulo}</p>}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] text-zinc-600">
                          <Eye className="w-3 h-3" /> {p.visualizacoes}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-zinc-600">
                          <Calendar className="w-3 h-3" /> {new Date(p.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                          expirada ? 'bg-red-500/10 text-red-400'
                          : p.hospedagem_vitalicia ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/p/${p.slug}`} target="_blank"
                        className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
