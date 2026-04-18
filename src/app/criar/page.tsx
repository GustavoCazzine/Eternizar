'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, GraduationCap, Star, ArrowRight, ArrowLeft, Upload, X, Plus, Camera, Check, ChevronRight, Music, Calendar, ImageIcon, Lock, MapPin, Clapperboard, Utensils } from 'lucide-react'
import BuscaMusica from '@/components/BuscaMusica'
import AuthButton from '@/components/AuthButton'
import { useBlobUrl, useBlobUrls } from '@/lib/useBlobUrl'
import { comprimirImagem } from '@/lib/comprimirImagem'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Evento {
  data: string; titulo: string; descricao: string; emoji: string; foto: File | null
}
interface DadosCasal {
  nome1: string; nome2: string; dataInicio: string; apelido1: string; apelido2: string
  cidadePrimeiroEncontro: string; comeFavorita: string; filmeFavorito: string
  musicaFavorita: string; comoSeConheceram: string
}
interface DadosFormatura {
  curso: string; instituicao: string; anoFormatura: string
  nomeTurma: string; quantidadeAlunos: string; casaisFormados: string
}
interface FotoComLegenda { file: File; legenda: string }
interface MusicaObj {
  nome: string; artista: string; album: string; capa: string
  previewUrl: string | null; duracaoMs: number
}
interface FormData {
  tipo: string; titulo: string; subtitulo: string; mensagem: string
  emailCliente: string; emailDestinatario: string; corTema: string
  fontePar: string
  compartilhavel: boolean
  fotoCapa: File | null
  musica: MusicaObj | null; fotos: FotoComLegenda[]; eventos: Evento[]
  senhaProtegida: string; senhaDica: string
  dadosCasal: DadosCasal; dadosFormatura: DadosFormatura
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const tipos = [
  { id: 'casal', label: 'Página do Casal', icon: '❤️', cor: '#ec4899', desc: 'Aniversário de namoro, Dia dos Namorados, surpresa romântica' },
  { id: 'formatura', label: 'Álbum de Formatura', icon: '🎓', cor: '#8b5cf6', desc: 'Álbum digital interativo com fotos e memórias da turma' },
  { id: 'homenagem', label: 'Homenagem Especial', icon: '⭐', cor: '#f59e0b', desc: 'Aniversários, conquistas, agradecimentos' },
]

const cores = [
  { nome: 'Rosa', valor: 'pink', hex: '#ec4899', classe: 'bg-pink-500' },
  { nome: 'Violeta', valor: 'violet', hex: '#8b5cf6', classe: 'bg-violet-500' },
  { nome: 'Âmbar', valor: 'amber', hex: '#f59e0b', classe: 'bg-amber-500' },
  { nome: 'Azul', valor: 'blue', hex: '#3b82f6', classe: 'bg-blue-500' },
  { nome: 'Verde', valor: 'emerald', hex: '#10b981', classe: 'bg-emerald-500' },
  { nome: 'Rose', valor: 'rose', hex: '#f43f5e', classe: 'bg-rose-500' },
]

const emojisRapidos = ['❤️', '🌹', '✈️', '🎉', '💍', '🏠', '🐾', '🎓', '⭐', '🌙', '🌊', '🎵']

const paresFonte = [
  { id: 'classico', nome: 'Clássico', desc: 'Elegante e atemporal', titulo: 'var(--font-cormorant)', corpo: 'var(--font-outfit)', preview: 'Cormorant + Outfit' },
  { id: 'moderno', nome: 'Moderno', desc: 'Limpo e contemporâneo', titulo: 'var(--font-space)', corpo: 'var(--font-inter)', preview: 'Space Grotesk + Inter' },
  { id: 'romantico', nome: 'Romântico', desc: 'Suave e poético', titulo: 'var(--font-playfair)', corpo: 'var(--font-outfit)', preview: 'Playfair + Outfit' },
  { id: 'divertido', nome: 'Divertido', desc: 'Casual e descontraído', titulo: 'var(--font-caveat)', corpo: 'var(--font-inter)', preview: 'Caveat + Inter' },
]

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 transition text-sm"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcTempoJuntos(dataInicio: string) {
  if (!dataInicio) return null
  const inicio = new Date(dataInicio)
  const agora = new Date()
  const diff = agora.getTime() - inicio.getTime()
  if (diff <= 0) return null
  const dias = Math.floor(diff / 86400000)
  const anos = Math.floor(dias / 365)
  const meses = Math.floor((dias % 365) / 30)
  const partes = []
  if (anos > 0) partes.push(`${anos} ano${anos > 1 ? 's' : ''}`)
  if (meses > 0 && anos < 4) partes.push(`${meses} ${meses > 1 ? 'meses' : 'mês'}`)
  return partes.join(' e ') || `${dias} dias`
}

function gerarTitulo(form: FormData) {
  if (form.tipo === 'casal') {
    const n1 = form.dadosCasal.nome1.trim()
    const n2 = form.dadosCasal.nome2.trim()
    if (n1 && n2) return `${n1} & ${n2}`
    return n1 || ''
  }
  if (form.tipo === 'formatura') {
    const c = form.dadosFormatura.curso.trim()
    const a = form.dadosFormatura.anoFormatura.trim()
    if (c && a) return `Turma de ${c} ${a}`
    return c ? `Turma de ${c}` : form.titulo
  }
  return form.titulo
}

function gerarSubtitulo(form: FormData) {
  if (form.tipo !== 'casal') return form.subtitulo
  const { apelido1, apelido2, dataInicio } = form.dadosCasal
  const tempo = calcTempoJuntos(dataInicio)
  const ap1 = apelido1.trim(); const ap2 = apelido2.trim()
  if (tempo && ap1 && ap2) return `${ap1} e ${ap2} — ${tempo} juntos 🥂`
  if (tempo) return `${tempo} de uma história linda 🥂`
  if (ap1 && ap2) return `${ap1} e ${ap2} ❤️`
  return 'Uma história de amor 💕'
}

// ─── Componente de campo ─────────────────────────────────────────────────────

function Label({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{children}</h2>
      {sub && <p className="text-sm text-zinc-500">{sub}</p>}
    </div>
  )
}

// ─── Prévia mini ─────────────────────────────────────────────────────────────


function Previa({ form, tituloFinal, subtituloFinal, corHex }: {
  form: FormData; tituloFinal: string; subtituloFinal: string; corHex: string
}) {
  const fotoCapa = useBlobUrl(form.fotoCapa)
  const fotosUrls = useBlobUrls(form.fotos.map(f => f.file))
  const totalFotos = form.fotos.length
  const totalMomentos = form.eventos.filter(e => e.titulo).length
  const paleta = cores.find(c => c.valor === form.corTema)
  const fundoAlt = paleta ? `${corHex}15` : '#2d0018'

  const fontes: Record<string, string> = {
    classico: 'var(--font-cormorant)',
    moderno: 'var(--font-space)',
    romantico: 'var(--font-playfair)',
    divertido: 'var(--font-caveat)',
  }
  const fontTitulo = fontes[form.fontePar] || fontes.classico

  return (
    <div className="rounded-[28px] overflow-hidden border border-white/8 shadow-2xl bg-black">
      {/* Hero fiel */}
      <div className="relative aspect-[9/16] w-full overflow-hidden">
        {/* Foto de capa como fundo */}
        {fotoCapa && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotoCapa} alt="" className="w-full h-full object-cover opacity-40 scale-110" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0" style={{
          background: fotoCapa
            ? `linear-gradient(to bottom, ${fundoAlt} 0%, rgba(8,8,12,0.7) 50%, #08080c 100%)`
            : `radial-gradient(ellipse at 50% 30%, ${corHex}25, #08080c 70%)`
        }} />

        {/* Glow orb */}
        <div className="absolute w-40 h-40 rounded-full blur-3xl opacity-25 top-1/4 left-1/2 -translate-x-1/2"
          style={{ background: corHex }} />

        {/* Partículas */}
        {[...Array(4)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: 2 + i, height: 2 + i, background: `${corHex}${40 + i * 10}`,
              left: `${15 + i * 22}%`, top: `${25 + i * 12}%` }}
            
          />
        ))}

        {/* Conteúdo centralizado */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-[8px] uppercase tracking-[0.25em] mb-2 font-medium" style={{ color: corHex }}>
            Uma surpresa especial
          </p>
          <motion.div>
            <Heart className="w-7 h-7 fill-current mb-2" style={{ color: corHex, filter: `drop-shadow(0 0 10px ${corHex}80)` }} />
          </motion.div>
          <h1 className="text-xl font-black text-white leading-tight mb-1 nome-capitalize px-2 break-words"
            style={{ fontFamily: fontTitulo, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {tituloFinal || <span className="text-white/30">Título aqui</span>}
          </h1>
          <p className="text-[10px] text-white/70 mt-1 nome-capitalize px-2">
            {subtituloFinal || <span className="text-white/20">Subtítulo</span>}
          </p>
        </div>
      </div>

      {/* Seções resumidas */}
      <div className="bg-[#08080c] p-3 space-y-2">
        {totalFotos > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {form.fotos.slice(0, 4).map((_, i) => (
                fotosUrls[i] && (
                  <div key={i} className="w-6 h-6 rounded-full overflow-hidden border-2" style={{ borderColor: corHex }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fotosUrls[i]!} alt="" className="w-full h-full object-cover" />
                  </div>
                )
              ))}
            </div>
            <span className="text-[10px] text-zinc-500">{totalFotos} memor{totalFotos === 1 ? 'ia' : 'ias'}</span>
          </div>
        )}

        {totalMomentos > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <Calendar className="w-3 h-3" style={{ color: corHex }} />
            <span>{totalMomentos} momento{totalMomentos !== 1 ? 's' : ''} na linha do tempo</span>
          </div>
        )}

        {form.musica && (
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <Music className="w-3 h-3" style={{ color: corHex }} />
            <span className="truncate">{form.musica.nome}</span>
          </div>
        )}

        {form.mensagem && (
          <div className="pt-2 border-t border-white/5">
            <p className="text-[9px] text-white/60 italic line-clamp-3 leading-relaxed" style={{ fontFamily: fontTitulo }}>
              “{form.mensagem}”
            </p>
          </div>
        )}

        {form.senhaProtegida && (
          <div className="flex items-center gap-2 text-[10px] text-zinc-600 pt-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: corHex }}>
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span>Protegida por senha</span>
          </div>
        )}

        {form.compartilhavel === false && (
          <div className="text-[10px] text-amber-400/80 pt-1">🔒 Modo privado (sem comentários)</div>
        )}
      </div>
    </div>
  )
}
// ─── Passos do formulário guiado ─────────────────────────────────────────────

interface PassoProps {
  form: FormData
  upd: (campo: keyof FormData, valor: unknown) => void
  updCasal: (campo: keyof DadosCasal, valor: string) => void
  updFormatura: (campo: keyof DadosFormatura, valor: string) => void
  addEvento: () => void
  addEventoComDados: (ev: Evento) => void
  removeEvento: (i: number) => void
  updEvento: (i: number, campo: keyof Evento, valor: unknown) => void
  handleFotos: (e: React.ChangeEvent<HTMLInputElement>) => void
  removerFoto: (i: number) => void
  atualizarLegenda: (i: number, legenda: string) => void
  handleFotoEvento: (i: number, e: React.ChangeEvent<HTMLInputElement>) => void
  tituloFinal: string
  subtituloFinal: string
}

// Passo 1: Tipo — onNext recebe o id diretamente para evitar problema de estado assíncrono
function PassoTipo({ form, onNext }: PassoProps & { onNext: (tipoId: string) => void }) {
  const icones: Record<string, React.ReactNode> = {
    casal: <Heart className="w-7 h-7" />,
    formatura: <GraduationCap className="w-7 h-7" />,
    homenagem: <Star className="w-7 h-7" />,
  }

  return (
    <div className="max-w-lg mx-auto pt-8">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.25em] mb-3 font-medium text-[#ff2d78]">Vamos começar</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Para quem é essa homenagem?</h1>
        <p className="text-zinc-500 text-sm">Escolha o tipo e nós guiamos você</p>
      </div>

      <div className="space-y-4">
        {tipos.map((t, i) => (
          <motion.button key={t.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNext(t.id)}
            className="group w-full p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 text-left flex items-center gap-5 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(135deg, ${t.cor}10, transparent)` }} />
            <div className="relative w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 shrink-0"
              style={{ color: t.cor }}>
              {icones[t.id]}
            </div>
            <div className="relative flex-1">
              <p className="font-bold text-white text-base mb-0.5">{t.label}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{t.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors relative" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Passo 2: Nomes (casal) ou Título
function PassoNomes({ form, upd, updCasal, updFormatura }: PassoProps) {
  if (form.tipo === 'casal') {
    return (
      <div className="space-y-4">
        <Label sub="Como vocês se chamam? Vamos criar a página de vocês.">Os nomes do casal</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Seu nome</p>
            <input value={form.dadosCasal.nome1} onChange={e => updCasal('nome1', e.target.value)}
              placeholder="Ex: Pedro" className={inputClass} autoFocus />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Nome dela/dele</p>
            <input value={form.dadosCasal.nome2} onChange={e => updCasal('nome2', e.target.value)}
              placeholder="Ex: Ana" className={inputClass} />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1.5">📅 Quando começou o namoro?</p>
          <input type="date" value={form.dadosCasal.dataInicio} onChange={e => updCasal('dataInicio', e.target.value)}
            className={inputClass} />
          {form.dadosCasal.dataInicio && (
            <p className="text-xs mt-1.5" style={{ color: '#ec4899' }}>
              ⏱ {calcTempoJuntos(form.dadosCasal.dataInicio)} juntos
            </p>
          )}
        </div>
          {form.dadosCasal.dataInicio && (() => {
            const d = Math.floor((Date.now() - new Date(form.dadosCasal.dataInicio).getTime()) / 86400000)
            return d > 0 ? <p className="text-sm mt-2 font-medium" style={{ color: '#ec4899' }}>Uau! Isso dá {d.toLocaleString('pt-BR')} dias juntos ♥</p> : null
          })()}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Seu apelido carinhoso</p>
            <input value={form.dadosCasal.apelido1} onChange={e => updCasal('apelido1', e.target.value)}
              placeholder="Ex: Amor, Bê..." className={inputClass} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Apelido dela/dele</p>
            <input value={form.dadosCasal.apelido2} onChange={e => updCasal('apelido2', e.target.value)}
              placeholder="Ex: Lindão, Gata..." className={inputClass} />
          </div>
        </div>
      </div>
    )
  }
  if (form.tipo === 'formatura') {
    return (
      <div className="space-y-4">
        <Label sub="Sobre a turma">Dados da formatura</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Curso *</p>
            <input value={form.dadosFormatura.curso} onChange={e => updFormatura('curso', e.target.value)}
              placeholder="Ex: Engenharia de Software" className={inputClass} autoFocus />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Ano</p>
            <input value={form.dadosFormatura.anoFormatura} onChange={e => updFormatura('anoFormatura', e.target.value)}
              placeholder="Ex: 2024" className={inputClass} />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1.5">Instituição</p>
          <input value={form.dadosFormatura.instituicao} onChange={e => updFormatura('instituicao', e.target.value)}
            placeholder="Ex: UNICAMP" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Nome da turma</p>
            <input value={form.dadosFormatura.nomeTurma} onChange={e => updFormatura('nomeTurma', e.target.value)}
              placeholder="Ex: Turma do Caos" className={inputClass} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Nº de alunos</p>
            <input type="number" value={form.dadosFormatura.quantidadeAlunos} onChange={e => updFormatura('quantidadeAlunos', e.target.value)}
              placeholder="Ex: 40" className={inputClass} />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <Label sub="Como a página vai se chamar?">Título da página</Label>
      <input value={form.titulo} onChange={e => upd('titulo', e.target.value)}
        placeholder="Ex: Feliz Aniversário, Maria! ⭐" className={inputClass} autoFocus />
    </div>
  )
}

// Passo 3: Foto de capa + fotos extras
function PassoFotos({ form, upd, handleFotos, removerFoto, atualizarLegenda }: PassoProps) {
  const fotoCapaUrl = useBlobUrl(form.fotoCapa)
  const fotosUrls = useBlobUrls(form.fotos.map(f => f.file))

  function handleCapa(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return
    upd('fotoCapa', e.target.files[0])
  }

  return (
    <div className="space-y-5">
      {/* Foto de capa */}
      <div>
        <Label sub="Aparece na abertura da página e na capa para Instagram">Foto de capa *</Label>
        {form.fotoCapa && fotoCapaUrl ? (
          <div className="relative rounded-2xl overflow-hidden aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotoCapaUrl} alt="Capa" className="w-full h-full object-cover" />
            <button onClick={() => upd('fotoCapa', null)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-pink-500/60 transition">
            <ImageIcon className="w-8 h-8 text-zinc-500 mb-2" />
            <p className="text-sm text-gray-400">Clique para selecionar a foto principal</p>
            <p className="text-xs text-gray-600 mt-1">Recomendado: foto dos dois juntos</p>
            <input type="file" accept="image/*" onChange={handleCapa} className="hidden" />
          </label>
        )}
      </div>

      {/* Fotos extras */}
      <div>
        <Label sub={`Aparecem nos stories (${form.fotos.length}/10)`}>Fotos para os stories</Label>
        {form.fotos.length < 10 && (
          <label className="flex items-center justify-center w-full h-16 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-pink-500/50 transition mb-3">
            <Upload className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-500">Adicionar fotos ({10 - form.fotos.length} restantes)</span>
            <input type="file" multiple accept="image/*" onChange={handleFotos} className="hidden" />
          </label>
        )}
        <div className="space-y-2">
          {form.fotos.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl border border-white/10">
              {fotosUrls[i] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotosUrls[i]!} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              )}
              <input value={f.legenda} onChange={e => atualizarLegenda(i, e.target.value)}
                placeholder={`Legenda da foto ${i + 1}...`}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none" />
              <button onClick={() => removerFoto(i)} className="text-gray-600 hover:text-red-400 transition shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Sugestões de momentos por tipo
const SUGESTOES_CASAL = [
  { emoji: '🌹', titulo: 'Como se conheceram', placeholder: 'Ex: Nos conhecemos na faculdade em uma quinta-feira...' },
  { emoji: '❤️', titulo: 'Primeiro beijo', placeholder: 'Ex: Foi em uma noite de verão, depois daquele jantar...' },
  { emoji: '📍', titulo: 'Primeira viagem juntos', placeholder: 'Ex: Nossa primeira viagem foi para o litoral...' },
  { emoji: '🎉', titulo: 'Aniversário de namoro', placeholder: 'Ex: Celebramos um ano com um jantar especial...' },
  { emoji: '🏠', titulo: 'Começamos a morar juntos', placeholder: 'Ex: O dia que a gente finalmente...' },
  { emoji: '💍', titulo: 'Pedido de casamento', placeholder: 'Ex: Eu nunca vou esquecer quando você...' },
]
const SUGESTOES_FORMATURA = [
  { emoji: '🎓', titulo: 'Primeiro dia de aula', placeholder: 'Ex: Chegamos sem conhecer ninguém...' },
  { emoji: '📚', titulo: 'Primeira prova difícil', placeholder: 'Ex: A prova de cálculo que quase nos eliminou...' },
  { emoji: '🍻', titulo: 'Primeira repetêco da turma', placeholder: 'Ex: O dia que todo mundo reuniu na casa do...' },
  { emoji: '🎮', titulo: 'Melhor memória coletiva', placeholder: 'Ex: Aquela semana de provas que virôu lenda...' },
  { emoji: '🎓', titulo: 'Colau!', placeholder: 'Ex: O dia que finalmente...' },
]

// Componente interno: preview com cleanup de blob URL
function FotoEventoPreview({ foto, onRemove, onSelect }: {
  foto: File | null
  onRemove: () => void
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const url = useBlobUrl(foto)

  if (foto && url) {
    return (
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="w-16 h-16 rounded-xl object-cover" />
        <div>
          <p className="text-xs text-gray-400 mb-1">Foto adicionada</p>
          <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-300">Remover</button>
        </div>
      </div>
    )
  }

  return (
    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition py-1">
      <Camera className="w-3.5 h-3.5" />
      <span>Adicionar foto deste momento</span>
      <input type="file" accept="image/*" onChange={onSelect} className="hidden" />
    </label>
  )
}

function PassoTimeline({ form, upd, addEvento, addEventoComDados, removeEvento, updEvento, handleFotoEvento }: PassoProps) {
  const sugestoes = form.tipo === 'formatura' ? SUGESTOES_FORMATURA : SUGESTOES_CASAL
  const [expandido, setExpandido] = useState<number | null>(0)
  function aplicarSugestao(s: typeof sugestoes[0]) {
    const idxVazio = form.eventos.findIndex(e => !e.titulo)
    if (idxVazio >= 0) {
      // Update atômico — emoji + titulo de uma vez só (evita state stale)
      const novos = [...form.eventos]
      novos[idxVazio] = { ...novos[idxVazio], emoji: s.emoji, titulo: s.titulo }
      upd('eventos', novos)
      setExpandido(idxVazio)
    } else {
      addEventoComDados({ data: '', titulo: s.titulo, descricao: '', emoji: s.emoji, foto: null })
      setExpandido(form.eventos.length)
    }
  }

  return (
    <div className="space-y-5">
      <Label sub={form.tipo === 'casal' ? 'Conte a história de vocês em momentos' : 'Os momentos marcantes da turma'}>
        Linha do tempo
      </Label>

      {/* Sugestões rápidas */}
      <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.03]">
        <p className="text-xs text-gray-500 mb-2.5">💡 Sugestões — clique para usar</p>
        <div className="flex gap-2 flex-wrap">
          {sugestoes.map((s, i) => (
            <button key={i} onClick={() => aplicarSugestao(s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition">
              <span>{s.emoji}</span>
              <span className="text-gray-300">{s.titulo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eventos */}
      <div className="space-y-3">
        {form.eventos.map((ev, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Cabeçalho clicavel */}
            <div
              onClick={() => setExpandido(expandido === i ? null : i)}
              className="w-full flex items-center gap-3 p-3.5 bg-white/5 hover:bg-white/8 transition text-left cursor-pointer"
            >
              <span className="text-xl">{ev.emoji || '⭐'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{ev.titulo || <span className="text-gray-600">Momento {i + 1}...</span>}</p>
                {ev.data && <p className="text-xs text-gray-500">{ev.data}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ev.foto && <span className="text-xs text-gray-500">🖼️</span>}
                {form.eventos.length > 1 && (
                  <button onClick={e => { e.stopPropagation(); removeEvento(i) }} className="text-gray-600 hover:text-red-400 transition p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-gray-600 text-xs">{expandido === i ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Conteúdo expandível */}
            <AnimatePresence>
              {expandido === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3.5 border-t border-white/10 space-y-3">
                    {/* Emojis rápidos */}
                    <div className="flex gap-1.5 flex-wrap">
                      {emojisRapidos.map(e => (
                        <button key={e} onClick={() => updEvento(i, 'emoji', e)}
                          className={`w-7 h-7 rounded-lg text-sm transition ${ev.emoji === e ? 'bg-pink-500/30 ring-1 ring-pink-500' : 'bg-white/5 hover:bg-white/10'}`}>
                          {e}
                        </button>
                      ))}
                    </div>

                    {/* Data + título */}
                    <div className="flex gap-2">
                      {/* Data como seletor de mês/ano */}
                      <div className="w-36">
                        <input
                          type="month"
                          value={ev.data ? (() => {
                            // Converte data salva (ex: 'Jun 2022') para formato YYYY-MM se necessário
                            const d = new Date(ev.data)
                            return isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
                          })() : ''}
                          onChange={e => {
                            if (!e.target.value) { updEvento(i, 'data', ''); return }
                            const [ano, mes] = e.target.value.split('-')
                            const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
                            updEvento(i, 'data', `${meses[parseInt(mes)-1]} ${ano}`)
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500 text-sm"
                        />
                        {ev.data && <p className="text-xs text-gray-600 mt-0.5 truncate">{ev.data}</p>}
                      </div>
                      <input value={ev.titulo} onChange={e => updEvento(i, 'titulo', e.target.value)}
                        placeholder="Título do momento"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 text-sm" />
                    </div>

                    {/* Descrição com placeholder inteligente e limite */}
                    <textarea value={ev.descricao}
                      onChange={e => updEvento(i, 'descricao', e.target.value.slice(0, 300))}
                      placeholder={sugestoes.find(s => s.titulo === ev.titulo)?.placeholder || 'Conte o que aconteceu nesse momento... (máx. 300 caracteres)'}
                      rows={3}
                      maxLength={300}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 text-sm resize-none" />
                    <p className="text-xs text-gray-600 text-right">{ev.descricao.length}/300</p>

                    {/* Foto do momento */}
                    <FotoEventoPreview
                      foto={ev.foto}
                      onRemove={() => updEvento(i, 'foto', null)}
                      onSelect={e => handleFotoEvento(i, e)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <button onClick={() => { addEvento(); setExpandido(form.eventos.length) }}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition w-full py-2">
        <Plus className="w-4 h-4" /> Adicionar momento
      </button>
    </div>
  )
}

// Passo 5: Música
function PassoMusica({ form, upd }: PassoProps) {
  return (
    <div className="space-y-4">
      <Label sub="Vai tocar automaticamente quando a página abrir">Música especial</Label>
      <BuscaMusica valor={form.musica} onChange={v => upd('musica', v)} />
      {form.musica && (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400">
          ✓ Preview de 30s inicia automaticamente · Botão para ouvir a música completa
        </div>
      )}
    </div>
  )
}

// Passo 6: Detalhes extras (casal)
function PassoDetalhes({ form, upd, updCasal, updFormatura }: PassoProps) {
  const corHex = cores.find(c => c.valor === form.corTema)?.hex || '#ec4899'

  return (
    <div className="space-y-5">
      {form.tipo === 'casal' && (
        <>
          <div>
            <Label sub="Aparece como citação poética na página">Como vocês se conheceram?</Label>
            <textarea value={form.dadosCasal.comoSeConheceram} onChange={e => updCasal('comoSeConheceram', e.target.value)}
              placeholder="Ex: Nos conhecemos na faculdade, em uma tarde que mudou tudo..." rows={3}
              className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Cidade do 1º encontro</p>
              <input value={form.dadosCasal.cidadePrimeiroEncontro} onChange={e => updCasal('cidadePrimeiroEncontro', e.target.value)}
                placeholder="Ex: São Paulo" className={inputClass} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><Utensils className="w-3 h-3" /> Comida favorita</p>
              <input value={form.dadosCasal.comeFavorita} onChange={e => updCasal('comeFavorita', e.target.value)}
                placeholder="Ex: Pizza de calabresa" className={inputClass} />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><Clapperboard className="w-3 h-3" /> Filme/série favorito</p>
            <input value={form.dadosCasal.filmeFavorito} onChange={e => updCasal('filmeFavorito', e.target.value)}
              placeholder="Ex: La La Land" className={inputClass} />
          </div>
        </>
      )}
      {form.tipo === 'formatura' && (
        <div>
          <p className="text-xs text-gray-400 mb-1.5">💑 Casais formados na turma</p>
          <input type="number" value={form.dadosFormatura.casaisFormados} onChange={e => updFormatura('casaisFormados', e.target.value)}
            placeholder="Ex: 3" className={inputClass} />
        </div>
      )}

      {/* Cor do tema */}
      <div>
        <Label sub="Define as cores de toda a página">Cor do tema</Label>
        <div className="flex gap-3 flex-wrap">
          {cores.map(c => (
            <button key={c.valor} onClick={() => upd('corTema', c.valor)}
              className={`w-10 h-10 rounded-full transition-all ${c.classe} ${form.corTema === c.valor ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a] scale-110' : 'opacity-60 hover:opacity-100'}`}
              title={c.nome} />
          ))}
        </div>
      </div>

      {/* Tipografia */}
      <div>
        <Label sub="Define o estilo das fontes da página">Tipografia</Label>
        <div className="grid grid-cols-2 gap-2">
          {paresFonte.map(p => (
            <button key={p.id} onClick={() => upd('fontePar', p.id)}
              className={`p-3 rounded-xl border text-left transition-all ${form.fontePar === p.id ? 'border-pink-500 bg-pink-500/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
              <p className="text-base font-bold text-white" style={{ fontFamily: p.titulo }}>{p.nome}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5" style={{ fontFamily: p.corpo }}>{p.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Passo 7: Mensagem + senha
function PassoMensagem({ form, upd }: PassoProps) {
  return (
    <div className="space-y-5">
      <div>
        <Label sub="Aparece no fechamento emocional da página">Mensagem do coração *</Label>
        
          {/* Varinha mágica */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className="text-xs text-zinc-600 self-center">Precisa de inspiração?</span>
            {[
              { label: 'Romântico', text: 'Cada dia ao seu lado é uma página nova da história mais bonita que eu já vivi. Você transformou meu mundo em algo que eu nem sabia que podia existir. Obrigado(a) por ser meu porto seguro, meu riso fácil e meu amor mais verdadeiro.' },
              { label: 'Divertido', text: 'Se alguém me dissesse que eu ia encontrar uma pessoa que aguenta minhas piadas ruins, come a última fatia de pizza comigo e ainda me faz rir todo dia... eu diria que essa pessoa merece um trófeu. Esse é você. Te amo, criatura!' },
              { label: 'Direto', text: 'Não sou de muitas palavras, mas preciso dizer: você é a melhor coisa que aconteceu na minha vida. Simples assim.' },
            ].map(opt => (
              <button key={opt.label} type="button"
                onClick={() => upd('mensagem', opt.text)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 hover:border-white/25 text-zinc-400 hover:text-white transition">
                ✨ {opt.label}
              </button>
            ))}
          </div>
<textarea value={form.mensagem} onChange={e => upd('mensagem', e.target.value.slice(0, 600))}
          rows={6} placeholder="Escreva aqui do coração... Esta mensagem aparece no final, como o grande fechamento emocional da página."
          maxLength={600}
          className={`${inputClass} resize-none`} />
        <p className="text-xs text-gray-600 mt-1">{form.mensagem.length}/600 caracteres</p>
      </div>

      <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-3">
        <Label sub="Só quem sabe a resposta pode abrir a página (opcional)"><span className="inline-flex items-center gap-2"><Lock className="w-4 h-4" /> Senha secreta</span></Label>
        <input value={form.senhaProtegida} onChange={e => upd('senhaProtegida', e.target.value)}
          placeholder="Ex: Onde foi nosso primeiro beijo?" className={inputClass} />
        {form.senhaProtegida && (
          <input value={form.senhaDica} onChange={e => upd('senhaDica', e.target.value)}
            placeholder='Ex: O nome do nosso pet, o lugar do primeiro encontro...'
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pink-500" />
        )}
      </div>

      {/* Toggle compartilhamento */}
      <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
        <button onClick={() => upd('compartilhavel', !form.compartilhavel)}
          className="w-full flex items-start gap-3 text-left">
          <div className={`shrink-0 w-11 h-6 rounded-full transition-all relative ${form.compartilhavel ? 'bg-pink-500' : 'bg-white/10'}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.compartilhavel ? 'left-5' : 'left-0.5'}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">
              {form.compartilhavel ? '🌍 Modo público' : '🔒 Modo privado'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {form.compartilhavel
                ? 'Permite livro de visitas, capa para Instagram e botões de compartilhar'
                : 'Apenas vocês dois. Sem commentários, sem capa de Instagram, sem compartilhamento'}
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}

// Passo 8: E-mail + confirmação
// Passo 8: E-mail + confirmação
function PassoEmail({ form, upd, tituloFinal, subtituloFinal, corHex, tipoSel, carregando, erro, onSubmit }: PassoProps & {
  corHex: string; tipoSel: typeof tipos[0] | undefined; carregando: boolean; erro: string; onSubmit: () => void
}) {
  const totalFotos = form.fotos.length
  const totalMomentos = form.eventos.filter(e => e.titulo).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Quase lá!</h2>
        <p className="text-sm text-zinc-500">Informe seu e-mail para receber o link da homenagem</p>
      </div>

      <div className="space-y-3">
        <input value={form.emailCliente} onChange={e => upd("emailCliente", e.target.value)}
          type="email" placeholder="seu@email.com" className={inputClass} autoFocus />
        <div>
          <p className="text-xs text-zinc-600 mb-1.5">E-mail de quem vai receber <span className="text-zinc-700">(opcional)</span></p>
          <input value={form.emailDestinatario} onChange={e => upd("emailDestinatario", e.target.value)}
            type="email" placeholder="presente@email.com" className={inputClass} />
        </div>
      </div>

      {/* Resumo — visual premium */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="p-4" style={{ background: `linear-gradient(135deg, ${corHex}08, transparent)` }}>
          <p className="text-[11px] text-zinc-600 uppercase tracking-[0.2em] mb-3">Sua homenagem</p>
          <div className="p-3 rounded-xl" style={{ background: `${corHex}10`, border: `1px solid ${corHex}20` }}>
            <p className="font-bold text-white text-sm nome-capitalize">{tituloFinal || "—"}</p>
            <p className="text-xs text-zinc-500 mt-0.5 nome-capitalize">{subtituloFinal}</p>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-2">
          {[  
            { label: tipoSel?.label || "Página", value: <Check className="w-3.5 h-3.5 text-emerald-400" />, show: true },
            { label: "Foto de capa", value: <Check className="w-3.5 h-3.5 text-emerald-400" />, show: !!form.fotoCapa },
            { label: "Galeria Stories", value: <span className="text-xs text-zinc-400">{totalFotos} foto{totalFotos !== 1 ? "s" : ""}</span>, show: totalFotos > 0 },
            { label: "Trilha sonora", value: <span className="text-xs text-zinc-400 truncate max-w-32">{form.musica?.nome}</span>, show: !!form.musica },
            { label: "Linha do tempo", value: <span className="text-xs text-zinc-400">{totalMomentos} momento{totalMomentos !== 1 ? "s" : ""}</span>, show: totalMomentos > 0 },
          ].filter(i => i.show).map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-zinc-500">{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 py-2">
        <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          <span>Seguro</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span>Instantâneo</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Privado</span>
        </div>
      </div>

      {erro && <p className="text-red-400 text-sm text-center">{erro}</p>}

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onSubmit} disabled={carregando}
        className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        style={{ background: `linear-gradient(135deg, ${corHex}, ${corHex}88)` }}>
        {carregando ? (
          <><motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> Criando sua homenagem...</>
        ) : (
          <>Criar minha homenagem <ArrowRight className="w-4 h-4" /></>
        )}
      </motion.button>
    </div>
  )
}

// ─── Definição dos passos ────────────────────────────────────────────────────

interface Passo {
  id: string
  titulo: string
  opcional?: boolean
  visivel: (form: FormData) => boolean
}

const PASSOS: Passo[] = [
  { id: 'tipo', titulo: 'Tipo', visivel: () => true },
  { id: 'nomes', titulo: 'Nomes', visivel: () => true },
  { id: 'fotos', titulo: 'Fotos', visivel: () => true },
  { id: 'timeline', titulo: 'Momentos', visivel: () => true, opcional: true },
  { id: 'musica', titulo: 'Música', visivel: () => true, opcional: true },
  { id: 'detalhes', titulo: 'Detalhes', visivel: () => true },
  { id: 'mensagem', titulo: 'Mensagem', visivel: () => true },
]

// ─── Componente principal ────────────────────────────────────────────────────

function CriarPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipoInicial = searchParams.get('tipo') || ''

  const [passo, setPasso] = useState(tipoInicial ? 1 : 0)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null)
      setAuthChecked(true)
    })
  }, [])

  const [form, setForm] = useState<FormData>({
    tipo: tipoInicial,
    titulo: '', subtitulo: '', mensagem: '',
    emailCliente: '', emailDestinatario: '',
    corTema: 'pink', fontePar: 'classico', compartilhavel: true, fotoCapa: null, musica: null,
    fotos: [], eventos: [{ data: '', titulo: '', descricao: '', emoji: '❤️', foto: null }],
    senhaProtegida: '', senhaDica: '',
    dadosCasal: { nome1: '', nome2: '', dataInicio: '', apelido1: '', apelido2: '', cidadePrimeiroEncontro: '', comeFavorita: '', filmeFavorito: '', musicaFavorita: '', comoSeConheceram: '' },
    dadosFormatura: { curso: '', instituicao: '', anoFormatura: '', nomeTurma: '', quantidadeAlunos: '', casaisFormados: '' },
  })

  const tituloFinal = gerarTitulo(form)
  const subtituloFinal = gerarSubtitulo(form)
  const tipoSel = tipos.find(t => t.id === form.tipo)
  const corHex = cores.find(c => c.valor === form.corTema)?.hex || '#ec4899'
  const passosVisiveis = PASSOS.filter(p => p.visivel(form))
  const totalPassos = passosVisiveis.length

  function upd(campo: keyof FormData, valor: unknown) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (erro) setErro('')
  }
  function updCasal(campo: keyof DadosCasal, valor: string) {
    setForm(prev => ({ ...prev, dadosCasal: { ...prev.dadosCasal, [campo]: valor } }))
    if (erro) setErro('')
  }
  function updFormatura(campo: keyof DadosFormatura, valor: string) {
    setForm(prev => ({ ...prev, dadosFormatura: { ...prev.dadosFormatura, [campo]: valor } }))
    if (erro) setErro('')
  }
  function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const novas = Array.from(e.target.files).slice(0, 10 - form.fotos.length)
    upd('fotos', [...form.fotos, ...novas.map(f => ({ file: f, legenda: '' }))].slice(0, 10))
  }
  function removerFoto(i: number) { upd('fotos', form.fotos.filter((_, idx) => idx !== i)) }
  function atualizarLegenda(i: number, legenda: string) {
    const novas = [...form.fotos]; novas[i] = { ...novas[i], legenda }; upd('fotos', novas)
  }
  function addEvento() { upd('eventos', [...form.eventos, { data: '', titulo: '', descricao: '', emoji: '⭐', foto: null }]) }
  function addEventoComDados(ev: Evento) { upd('eventos', [...form.eventos, ev]) }
  function removeEvento(i: number) { upd('eventos', form.eventos.filter((_, idx) => idx !== i)) }
  function updEvento(i: number, campo: keyof Evento, valor: unknown) {
    const novos = [...form.eventos]; novos[i] = { ...novos[i], [campo]: valor }; upd('eventos', novos)
  }
  function handleFotoEvento(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return; updEvento(i, 'foto', e.target.files[0])
  }

  function validarPasso(): string {
    const p = passosVisiveis[passo]?.id

    if (p === "nomes") {
      if (form.tipo === "casal") {
        if (!form.dadosCasal.nome1.trim() || !form.dadosCasal.nome2.trim()) return "Preencha os nomes do casal."
        if (form.dadosCasal.nome1.trim().length < 2) return "Nome muito curto (mínimo 2 caracteres)."
        if (form.dadosCasal.nome1.trim().length > 30 || form.dadosCasal.nome2.trim().length > 30) return "Nome muito longo (máximo 30 caracteres)."
        if (form.dadosCasal.dataInicio) {
          const d = new Date(form.dadosCasal.dataInicio)
          if (d > new Date()) return "A data não pode ser no futuro."
          if (d < new Date("1950-01-01")) return "Data inválida."
        }
      }
      if (form.tipo === "formatura") {
        if (!form.dadosFormatura.curso.trim()) return "Preencha o curso."
        if (form.dadosFormatura.curso.trim().length > 60) return "Nome do curso muito longo."
        if (form.dadosFormatura.anoFormatura) {
          const ano = parseInt(form.dadosFormatura.anoFormatura)
          if (isNaN(ano) || ano < 1950 || ano > new Date().getFullYear() + 6) return "Ano inválido."
        }
      }
      if (form.tipo === "homenagem" && !form.titulo.trim()) return "Preencha o título da página."
    }
    if (p === "fotos" && !form.fotoCapa) return "Adicione uma foto de capa."
    if (p === "mensagem") {
      if (!form.mensagem.trim()) return "A mensagem é obrigatória."
      if (form.mensagem.trim().length < 10) return "Mensagem muito curta (mínimo 10 caracteres)."
    }
    if (p === "email") {
      if (!form.emailCliente.trim()) return "Preencha seu e-mail."
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.emailCliente.trim())) return "E-mail inválido."
      if (form.emailDestinatario && !emailRegex.test(form.emailDestinatario.trim())) return "E-mail do destinatário inválido."
    }
    return ""
  }

  function avancar() {
    const erroV = validarPasso()
    if (erroV) { setErro(erroV); return }
    setErro('')
    if (passo < totalPassos - 1) setPasso(p => p + 1)
  }

  function voltar() {
    setErro('')
    if (passo > 0) setPasso(p => p - 1)
    else router.push('/')
  }

  async function handleSubmit() {
    setErro('')
    if (!userEmail) {
      const redirect = encodeURIComponent('/criar')
      router.push(`/entrar?redirect=${redirect}`)
      return
    }
    if (!form.mensagem) { setErro('Ops! Faltou escrever a mensagem do coração.'); return }
    setCarregando(true)
    try {
      const fd = new FormData()
      fd.append('tipo', form.tipo)
      fd.append('titulo', tituloFinal)
      fd.append('subtitulo', subtituloFinal)
      fd.append('mensagem', form.mensagem)
      fd.append('emailCliente', userEmail)
      fd.append('emailDestinatario', '')
      fd.append('corTema', form.corTema)
      fd.append('fontePar', form.fontePar)
      fd.append('compartilhavel', form.compartilhavel ? 'true' : 'false')
      fd.append('musica', JSON.stringify(form.musica))
      fd.append('eventos', JSON.stringify(form.eventos.map(e => ({ data: e.data, titulo: e.titulo, descricao: e.descricao, emoji: e.emoji }))))
      fd.append('senhaProtegida', form.senhaProtegida)
      fd.append('senhaDica', form.senhaDica)
      fd.append('dadosCasal', JSON.stringify(form.dadosCasal))
      fd.append('dadosFormatura', JSON.stringify(form.dadosFormatura))
      fd.append('fotosLegendas', JSON.stringify(form.fotos.map(f => f.legenda)))
      // Comprimir fotos antes de enviar
      const fotosComprimidas = await Promise.all(form.fotos.map(f => comprimirImagem(f.file)))
      fotosComprimidas.forEach(f => fd.append('fotos', f))
      if (form.fotoCapa) { const capaComprimida = await comprimirImagem(form.fotoCapa); fd.append('fotoCapa', capaComprimida) }
      for (let i = 0; i < form.eventos.length; i++) { if (form.eventos[i].foto) { const evComp = await comprimirImagem(form.eventos[i].foto!); fd.append(`eventoFoto_${i}`, evComp) } }


      const res = await fetch('/api/criar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro || 'Não conseguimos criar a página. Tente de novo?')
      router.push(data.sucesso || `/p/${data.slug}`)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Algo deu errado, mas não se preocupe. Tente novamente!')
    } finally {
      setCarregando(false)
    }
  }

  const passosProps: PassoProps = {
    form, upd, updCasal, updFormatura,
    addEvento, addEventoComDados, removeEvento, updEvento,
    handleFotos, removerFoto, atualizarLegenda, handleFotoEvento,
    tituloFinal, subtituloFinal,
  }

  const passoAtual = passosVisiveis[passo]

  return (
    <div className="min-h-screen bg-[#08080c] text-white relative overflow-hidden">

      {/* Glow orbs de fundo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full blur-[40px] md:blur-[80px] opacity-12"
          style={{ background: "radial-gradient(circle, #ff2d78, transparent 70%)", top: "-10%", right: "-10%" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[40px] md:blur-[80px] opacity-8"
          style={{ background: "radial-gradient(circle, #c850c0, transparent 70%)", bottom: "10%", left: "-5%" }} />
      </div>

      {/* Partículas */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: 3 + (i % 3) * 2, height: 3 + (i % 3) * 2, background: `${corHex}${30 + i * 10}`,
              left: `${10 + i * 15}%`, top: `${20 + ((i * 17) % 50)}%` }}
            
          />
        ))}
      </div>

      {/* Header minimalista: logo + progress + auth */}
      <div className="sticky top-0 z-40 bg-[#08080c]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 h-14 flex items-center gap-3 sm:gap-4">
          <a href="/" className="shrink-0">
            <img src="/logo.png" alt="Eternizar" className="h-9 sm:h-11" />
          </a>
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${corHex}, ${corHex}88)` }}
              animate={{ width: `${((passo + 1) / totalPassos) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-zinc-600 shrink-0 tabular-nums">{passo + 1}/{totalPassos}</span>
          <div className="shrink-0 pl-2 border-l border-white/5">
            <AuthButton variant="header" />
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div className="flex relative z-10">

        {/* Formulário — centro */}
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full min-h-[calc(100vh-3.5rem)]">
          <div className="flex-1 px-3 sm:px-6 py-6 sm:py-10">

            {/* Cabeçalho do passo */}
            {passoAtual && passoAtual.id !== "tipo" && (
              <motion.div
                key={`header-${passoAtual.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <p className="text-xs uppercase tracking-[0.25em] mb-2 font-medium" style={{ color: corHex }}>
                  {['Escolha o tipo...', 'Começo da mágica...', 'Capturando momentos...', 'Relembrando a história...', 'A trilha sonora...', 'Detalhes especiais...', 'Quase pronto para emocionar!', 'Últimos toques...'][Math.min(passo, 7)]}
                </p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={passoAtual?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {passoAtual?.id === "tipo" && <PassoTipo {...passosProps} onNext={(tipoId) => { upd("tipo", tipoId); setPasso(1) }} />}
                {passoAtual?.id === "nomes" && <PassoNomes {...passosProps} />}
                {passoAtual?.id === "fotos" && <PassoFotos {...passosProps} />}
                {passoAtual?.id === "timeline" && <PassoTimeline {...passosProps} />}
                {passoAtual?.id === "musica" && <PassoMusica {...passosProps} />}
                {passoAtual?.id === "detalhes" && <PassoDetalhes {...passosProps} />}
                {passoAtual?.id === "mensagem" && <PassoMensagem {...passosProps} />}
                {passoAtual?.id === "email" && (
                  <PassoEmail {...passosProps}
                    corHex={corHex} tipoSel={tipoSel}
                    carregando={carregando} erro={erro}
                    onSubmit={handleSubmit}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navegação inferior */}
          {passoAtual?.id !== "tipo" && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-white/5 flex gap-2 sm:gap-3 sticky bottom-0 bg-[#08080c]/90 backdrop-blur-xl">
              <button onClick={voltar} className="px-3 sm:px-4 py-3 rounded-xl text-sm text-zinc-500 hover:text-white border border-white/10 hover:border-white/20 transition min-h-[44px]">
                <ArrowLeft className="w-4 h-4" />
              </button>
              {passoAtual?.opcional && (
                <button onClick={() => { setErro(""); setPasso(p => p + 1) }}
                  className="px-4 sm:px-5 py-3 text-sm text-zinc-500 hover:text-zinc-300 transition min-h-[44px]">
                  Pular
                </button>
              )}
              {passo === totalPassos - 1 ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit} disabled={carregando}
                  className="flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm transition-all min-h-[44px] disabled:opacity-50"
                  style={{ background: erro ? "rgba(244,63,94,0.2)" : `linear-gradient(135deg, ${corHex}, ${corHex}88)` }}>
                  {carregando ? <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    : erro ? <span className="text-red-300 text-sm">{erro}</span>
                    : !userEmail && authChecked ? <>Entrar para finalizar <ArrowRight className="w-4 h-4" /></>
                    : <>Criar homenagem <ArrowRight className="w-4 h-4" /></>}
                </motion.button>
              ) : (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={avancar}
                  className="flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm transition-all min-h-[44px]"
                  style={{ background: erro ? "rgba(244,63,94,0.2)" : `linear-gradient(135deg, ${corHex}, ${corHex}88)` }}>
                  {erro ? <span className="text-red-300 text-sm">{erro}</span> : <>Continuar <ArrowRight className="w-4 h-4" /></>}
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* Prévia — direita (desktop) — oculta até escolher tipo */}
        {form.tipo && (
        <div className="hidden lg:flex w-80 xl:w-96 border-l border-white/5 p-6 flex-col gap-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <p className="text-xs text-zinc-600 uppercase tracking-[0.2em]">Prévia ao vivo</p>
          <Previa form={form} tituloFinal={tituloFinal} subtituloFinal={subtituloFinal} corHex={corHex} />
        </div>
        )}
      </div>

      {/* Prévia mobile — oculta até escolher tipo */}
      {form.tipo && (
      <div className="lg:hidden fixed bottom-20 right-4 z-30">
        <details className="group">
          <summary className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer list-none shadow-lg shadow-black/50 border border-white/10"
            style={{ background: `linear-gradient(135deg, ${corHex}, ${corHex}88)` }}>
            <Camera className="w-5 h-5 text-white" />
          </summary>
          <div className="absolute bottom-14 right-0 w-64 shadow-2xl">
            <Previa form={form} tituloFinal={tituloFinal} subtituloFinal={subtituloFinal} corHex={corHex} />
          </div>
        </details>
      </div>
      )}
    </div>
  )
}


export default function CriarPage() {
  return <Suspense><CriarPageContent /></Suspense>
}
