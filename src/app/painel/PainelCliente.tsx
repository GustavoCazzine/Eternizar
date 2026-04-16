'use client'

import { motion } from 'framer-motion'
import { Heart, Plus, Eye, Calendar, ExternalLink, LogOut, ChevronRight, Share2, Pencil, Download, X } from 'lucide-react'
import CapaInstagram from '@/components/CapaInstagram'
import CapaSpotify from '@/components/CapaSpotify'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Pagina {
  slug: string; tipo: string; titulo: string; subtitulo: string
  cor_tema: string; ativa: boolean; visualizacoes: number
  created_at: string; hospedagem_vitalicia: boolean; expira_em: string | null
  fotos: Array<{ url: string; isCapa?: boolean }>
}

interface User { id: string; email: string; nome: string; avatar: string }

const coresMap: Record<string, { primaria: string; secundaria: string; fundo: string }> = {
  pink:    { primaria: '#ec4899', secundaria: '#f43f5e', fundo: '#1a0010' },
  violet:  { primaria: '#8b5cf6', secundaria: '#7c3aed', fundo: '#0d0020' },
  amber:   { primaria: '#f59e0b', secundaria: '#f97316', fundo: '#1a1000' },
  blue:    { primaria: '#3b82f6', secundaria: '#06b6d4', fundo: '#000d1a' },
  emerald: { primaria: '#10b981', secundaria: '#14b8a6', fundo: '#001a0d' },
  rose:    { primaria: '#f43f5e', secundaria: '#ec4899', fundo: '#1a0008' },
}

const tiposIcons: Record<string, string> = {
  casal: '♥', formatura: '★', homenagem: '★',
}

function diasRestantes(expira_em: string | null, vitalicia: boolean): string {
  if (vitalicia) return 'Permanente'
  if (!expira_em) return ''
  const dias = Math.ceil((new Date(expira_em).getTime() - Date.now()) / 86400000)
  if (dias < 0) return 'Expirada'
  if (dias === 0) return 'Expira hoje'
  return `${dias}d`
}

function mascararEmail(email: string): string {
  const [user, dom] = email.split('@')
  if (!user || !dom) return email
  const visivel = user.length <= 3 ? user[0] : user.slice(0, 2)
  return `${visivel}***@${dom}`
}

export default function PainelCliente({ user, paginas }: { user: User; paginas: Pagina[] }) {
  const cor = '#ff2d78'
  const [copiado, setCopiado] = useState<string | null>(null)
  const [modalCapa, setModalCapa] = useState<Pagina | null>(null)

  useEffect(() => {
    if (!modalCapa) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalCapa(null) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [modalCapa])
  const coresMap: Record<string, string> = { pink:'#ff2d78', violet:'#8b5cf6', amber:'#f59e0b', blue:'#3b82f6', emerald:'#10b981', rose:'#f43f5e' }

  async function compartilhar(slug: string) {
    const url = `${window.location.origin}/p/${slug}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Eternizar', url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopiado(slug)
      setTimeout(() => setCopiado(null), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#08080c] text-white relative overflow-hidden">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full blur-[40px] md:blur-[80px] opacity-12"
          style={{ background: 'radial-gradient(circle, #ff2d78, transparent 70%)', top: '-10%', right: '-10%' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[80px] md:blur-[60px] md:blur-[30px] md:blur-[60px] opacity-8"
          style={{ background: 'radial-gradient(circle, #c850c0, transparent 70%)', bottom: '10%', left: '-5%' }} />
      </div>

      {/* Partículas */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: 3 + i, height: 3 + i, background: `rgba(255,45,120,${0.15 + i * 0.05})`,
              left: `${10 + i * 18}%`, top: `${15 + i * 16}%` }}
            animate={{ y: [-15, 15, -15], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#08080c]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Eternizar" className="h-11 sm:h-12" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white font-medium nome-capitalize">{user.nome || mascararEmail(user.email)}</p>
              {user.nome && <p className="text-[11px] text-zinc-600">{mascararEmail(user.email)}</p>}
            </div>
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" className="w-9 h-9 rounded-full border border-white/10" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#ff2d78]/20 flex items-center justify-center text-sm font-bold text-[#ff2d78]">
                {(user.nome || user.email)[0].toUpperCase()}
              </div>
            )}
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-zinc-600 hover:text-zinc-400 transition p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Sair">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.25em] mb-2 font-medium text-[#ff2d78]">Sua coleção</p>
            <h1 className="text-3xl sm:text-4xl font-black">Minhas Homenagens</h1>
            <p className="text-zinc-500 text-sm mt-2">{paginas.length} página{paginas.length !== 1 ? 's' : ''} criada{paginas.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/criar"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] min-h-[44px] shrink-0"
            style={{ background: `linear-gradient(135deg, ${cor}, ${cor}aa)`, boxShadow: `0 8px 24px ${cor}25` }}>
            <Plus className="w-4 h-4" /> Nova homenagem
          </Link>
        </motion.div>

        {paginas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 sm:py-32"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Heart className="w-16 h-16 mx-auto fill-current" style={{ color: `${cor}40`, filter: `drop-shadow(0 0 30px ${cor}30)` }} />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-300 mb-2">Sua primeira história espera</h2>
            <p className="text-zinc-600 text-sm mb-8 max-w-sm mx-auto">Crie uma homenagem e surpreenda alguém especial com momentos eternizados.</p>
            <Link href="/criar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${cor}, ${cor}aa)`, boxShadow: `0 8px 24px ${cor}25` }}>
              Criar minha primeira <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginas.map((p, i) => {
              const paleta = coresMap[p.cor_tema] || coresMap.pink
              const corTema = paleta.primaria
              const capa = p.fotos?.find((f: { isCapa?: boolean }) => f.isCapa)?.url
              const status = diasRestantes(p.expira_em, p.hospedagem_vitalicia)
              const expirada = status === 'Expirada'
              const icon = tiposIcons[p.tipo] || '’Œ'

              return (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                  className={`group relative rounded-3xl border border-white/8 bg-white/[0.02] overflow-hidden hover:border-white/20 transition-all duration-300 ${expirada ? 'opacity-60' : ''}`}
                  style={{
                    boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
                  }}
                >
                  {/* Capa estilo Spotify Wrapped */}
                  <Link href={`/p/${p.slug}`} target="_blank" className="block relative aspect-[4/5] overflow-hidden">
                    {/* Background gradiente */}
                    <div className="absolute inset-0" style={{
                      background: capa
                        ? `linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%)`
                        : `radial-gradient(ellipse at 50% 30%, ${corTema}30, ${paleta.fundo})`
                    }} />

                    {capa && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={capa} alt={p.titulo}
                        className="absolute inset-0 w-full h-full object-cover -z-10 group-hover:scale-105 transition-transform duration-700" />
                    )}

                    {/* Glow orb */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-25 pointer-events-none"
                      style={{ background: corTema }} />

                    {/* Badge tipo */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-medium"
                      style={{ background: `${corTema}25`, border: `1px solid ${corTema}40`, color: 'white' }}>
                      <span>{icon}</span>
                      <span className="capitalize">{p.tipo}</span>
                    </div>

                    {/* Status */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`text-[10px] px-2 py-1 rounded-full backdrop-blur-md font-semibold ${
                        expirada ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : p.hospedagem_vitalicia ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {status}
                      </span>
                    </div>

                    {/* Coração centralizado quando sem capa */}
                    {!capa && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="w-16 h-16 fill-current" style={{ color: corTema, filter: `drop-shadow(0 0 20px ${corTema}80)` }} />
                      </div>
                    )}

                    {/* Conteúdo embaixo */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                      <h3 className="font-black text-white text-xl leading-tight nome-capitalize line-clamp-2 mb-1"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                        {p.titulo}
                      </h3>
                      {p.subtitulo && (
                        <p className="text-xs text-white/70 nome-capitalize line-clamp-1"
                          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
                          {p.subtitulo}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Footer card */}
                  <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {p.visualizacoes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link href={`/editar/${p.slug}`}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => compartilhar(p.slug)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition"
                        title="Compartilhar"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setModalCapa(p)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition"
                        title="Baixar capas"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <Link href={`/p/${p.slug}`} target="_blank"
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition"
                        title="Abrir"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {copiado === p.slug && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/90 text-white shadow-lg z-20 pointer-events-none">
                      Link copiado!
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {modalCapa && (() => {
          const corHex = coresMap[modalCapa.cor_tema] || (modalCapa.cor_tema?.startsWith('#') ? modalCapa.cor_tema : '#ff2d78')
          const fotoCapa = modalCapa.fotos?.find(f => f.isCapa)?.url || modalCapa.fotos?.[0]?.url
          return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalCapa(null)}>
              <div className="bg-[#0f0f14] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Baixar capas</h3>
                  <button onClick={() => setModalCapa(null)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-zinc-500 text-center mb-2">Story (1080x1920)</p>
                    <CapaInstagram titulo={modalCapa.titulo} subtitulo={modalCapa.subtitulo} corHex={corHex} tipo={modalCapa.tipo} fotoCapa={fotoCapa} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 text-center mb-2">Spotify (1080x1080)</p>
                    <CapaSpotify titulo={modalCapa.titulo} subtitulo={modalCapa.subtitulo} corHex={corHex} tipo={modalCapa.tipo} fotoCapa={fotoCapa} />
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </main>
    </div>
  )
}
