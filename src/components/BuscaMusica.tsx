'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Music, Play, Pause, X, Check } from 'lucide-react'

interface Musica {
 id: string
 nome: string
 artista: string
 album: string
 capa: string
 previewUrl: string | null
 duracaoMs: number
}

interface MusicaSelecionada {
 nome: string
 artista: string
 album: string
 capa: string
 previewUrl: string | null
 duracaoMs: number
}

interface Props {
 valor: MusicaSelecionada | null
 onChange: (musica: MusicaSelecionada | null) => void
}

function formatarDuracao(ms: number) {
 const s = Math.floor(ms / 1000)
 return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function BuscaMusica({ valor, onChange }: Props) {
 const [query, setQuery] = useState('')
 const [resultados, setResultados] = useState<Musica[]>([])
 const [buscando, setBuscando] = useState(false)
 const [tocando, setTocando] = useState<string | null>(null)
 const [aberto, setAberto] = useState(false)
 const [erroBusca, setErroBusca] = useState<string>('')
 const audioRef = useRef<HTMLAudioElement | null>(null)
 const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

 useEffect(() => {
 return () => {
 audioRef.current?.pause()
 audioRef.current = null
 if (timerRef.current) clearTimeout(timerRef.current)
 }
 }, [])

 async function buscar(q: string) {
 if (q.trim().length < 2) { setResultados([]); setErroBusca(''); return }
 setBuscando(true)
 setErroBusca('')
 try {
 const res = await fetch(`/api/musica?q=${encodeURIComponent(q)}`)
 if (!res.ok) {
 if (res.status === 429) {
 setErroBusca('Muitas buscas. Aguarde um momento.')
 } else {
 setErroBusca('Erro ao buscar. Tente novamente.')
 }
 setResultados([])
 setAberto(true)
 return
 }
 const data = await res.json()
 setResultados(Array.isArray(data.resultados) ? data.resultados : [])
 setAberto(true)
 } catch {
 setErroBusca('Sem conexão. Verifique sua internet.')
 setResultados([])
 setAberto(true)
 } finally {
 setBuscando(false)
 }
 }

 function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
 const v = e.target.value
 setQuery(v)
 if (timerRef.current) clearTimeout(timerRef.current)
 timerRef.current = setTimeout(() => buscar(v), 400)
 }

 function togglePreview(musica: Musica) {
 if (!musica.previewUrl) return

 if (tocando === musica.id) {
 audioRef.current?.pause()
 setTocando(null)
 return
 }

 audioRef.current?.pause()
 const audio = new Audio(musica.previewUrl)
 audio.volume = 0.6
 audio.onended = () => setTocando(null)
 audio.onerror = () => setTocando(null)
 audioRef.current = audio
 setTocando(musica.id)

 // Browsers rejeitam play() sem gesto do usuário ou se o arquivo falhar.
 // Trata pra evitar Unhandled Promise Rejection e reseta o estado visual.
 audio.play().catch(() => {
 setTocando(null)
 if (audioRef.current === audio) audioRef.current = null
 })
 }

 function selecionar(musica: Musica) {
 audioRef.current?.pause()
 setTocando(null)
 onChange({
 nome: musica.nome,
 artista: musica.artista,
 album: musica.album,
 capa: musica.capa,
 previewUrl: musica.previewUrl,
 duracaoMs: musica.duracaoMs,
 })
 setAberto(false)
 setQuery('')
 setResultados([])
 }

 function remover() {
 audioRef.current?.pause()
 setTocando(null)
 onChange(null)
 }

 // Música já selecionada
 if (valor) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
 >
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={valor.capa} alt={valor.album} className="w-14 h-14 rounded-xl object-cover shrink-0" />
 <div className="flex-1 min-w-0">
 <p className="font-semibold text-white truncate">{valor.nome}</p>
 <p className="text-sm text-gray-400 truncate">{valor.artista} · {valor.album}</p>
 {valor.duracaoMs > 0 && (
 <p className="text-xs text-gray-600 mt-0.5">{formatarDuracao(valor.duracaoMs)}</p>
 )}
 </div>
 <div className="flex items-center gap-2 shrink-0">
 {valor.previewUrl && (
 <button
 onClick={() => togglePreview({ ...valor, id: 'selected' } as Musica)}
 className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
 title="Ouvir preview"
 >
 {tocando === 'selected' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
 </button>
 )}
 <button
 onClick={remover}
 className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition"
 title="Remover"
 >
 <X className="w-4 h-4 text-red-400" />
 </button>
 </div>
 </motion.div>
 )
 }

 return (
 <div className="relative">
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
 <input
 value={query}
 onChange={handleInput}
 onFocus={() => resultados.length > 0 && setAberto(true)}
 placeholder="Pesquise por nome da música ou artista..."
 className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 transition"
 />
 {buscando && (
 <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
 )}
 </div>

 <AnimatePresence>
 {aberto && erroBusca && resultados.length === 0 && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 className="absolute z-50 w-full mt-2 rounded-2xl border border-red-500/20 bg-[#1a1a1a] shadow-2xl overflow-hidden"
 >
 <div className="px-4 py-3 text-xs text-red-400 flex items-center justify-between">
 <span>{erroBusca}</span>
 <button onClick={() => { setAberto(false); setErroBusca('') }} className="text-zinc-600 hover:text-zinc-400">
 Fechar
 </button>
 </div>
 </motion.div>
 )}

 {aberto && resultados.length > 0 && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 className="absolute z-50 w-full mt-2 rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl overflow-hidden"
 >
 {resultados.map((musica) => (
 <div
 key={musica.id}
 className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition cursor-pointer group"
 >
 {/* Capa */}
 <div className="relative shrink-0">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={musica.capa} alt={musica.album} className="w-11 h-11 rounded-lg object-cover" />
 {musica.previewUrl && (
 <button
 onClick={e => { e.stopPropagation(); togglePreview(musica) }}
 className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
 >
 {tocando === musica.id
 ? <Pause className="w-4 h-4 text-white" />
 : <Play className="w-4 h-4 text-white" />
 }
 </button>
 )}
 </div>

 {/* Info */}
 <div className="flex-1 min-w-0" onClick={() => selecionar(musica)}>
 <p className="font-medium text-white text-sm truncate">{musica.nome}</p>
 <p className="text-xs text-gray-400 truncate">{musica.artista} · {musica.album}</p>
 </div>

 {/* Duração + Selecionar */}
 <div className="flex items-center gap-2 shrink-0">
 <span className="text-xs text-gray-600">{formatarDuracao(musica.duracaoMs)}</span>
 <button
 onClick={() => selecionar(musica)}
 className="w-7 h-7 rounded-full bg-pink-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-pink-500/40"
 >
 <Check className="w-3.5 h-3.5 text-pink-400" />
 </button>
 </div>
 </div>
 ))}

 <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
 <p className="text-xs text-gray-600 flex items-center gap-1">
 <Music className="w-3 h-3" /> Preview de 30s via iTunes
 </p>
 <button onClick={() => setAberto(false)} className="text-xs text-gray-600 hover:text-gray-400">
 Fechar
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}
