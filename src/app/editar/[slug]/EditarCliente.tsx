'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Trash2, Plus, X, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Evento {
 data: string; titulo: string; descricao: string; emoji: string; fotoUrl?: string
}
interface DadosCasal {
 nome1: string; nome2: string; dataInicio: string; apelido1: string; apelido2: string
 cidadePrimeiroEncontro: string; comeFavorita: string; filmeFavorito: string
 musicaFavorita: string; comoSeConheceram: string
}
interface Pagina {
 slug: string; tipo: string; titulo: string; subtitulo: string; mensagem: string
 cor_tema: string; fonte_par?: string; senha_dica?: string
 dados_casal?: DadosCasal | null; linha_do_tempo: Evento[]
}

const cores = [
 { valor: 'pink', hex: '#B91C3C', classe: 'bg-pink-500' },
 { valor: 'violet', hex: '#8b5cf6', classe: 'bg-violet-500' },
 { valor: 'amber', hex: '#f59e0b', classe: 'bg-amber-500' },
 { valor: 'blue', hex: '#3b82f6', classe: 'bg-blue-500' },
 { valor: 'emerald', hex: '#10b981', classe: 'bg-emerald-500' },
 { valor: 'rose', hex: '#f43f5e', classe: 'bg-rose-500' },
]

const paresFonte = [
 { id: 'classico', nome: 'Clássico', titulo: 'var(--font-cormorant)' },
 { id: 'moderno', nome: 'Moderno', titulo: 'var(--font-space)' },
 { id: 'romantico', nome: 'Romântico', titulo: 'var(--font-playfair)' },
 { id: 'divertido', nome: 'Divertido', titulo: 'var(--font-caveat)' },
]

const emojisRapidos = ['♥', '', '→', '', '◆', '○', '•', '★', '★', '●', '○', '♫']

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 transition text-sm"

function calcTempoJuntos(dataInicio: string) {
 if (!dataInicio) return null
 const inicio = new Date(dataInicio)
 const agora = new Date()
 const diff = agora.getTime() - inicio.getTime()
 if (diff <= 0) return null
 const dias = Math.floor(diff / 86400000)
 const anos = Math.floor(dias / 365)
 const meses = Math.floor((dias % 365) / 30)
 const partes: string[] = []
 if (anos > 0) partes.push(`${anos} ano${anos > 1 ? 's' : ''}`)
 if (meses > 0 && anos < 4) partes.push(`${meses} ${meses > 1 ? 'meses' : 'mês'}`)
 return partes.join(' e ') || `${dias} dias`
}

function gerarTituloAuto(tipo: string, dc: DadosCasal): string {
 if (tipo === 'casal') {
 const n1 = dc.nome1.trim(), n2 = dc.nome2.trim()
 if (n1 && n2) return `${n1} & ${n2}`
 return n1 || ''
 }
 return ''
}

function gerarSubtituloAuto(tipo: string, dc: DadosCasal): string {
 if (tipo !== 'casal') return ''
 const tempo = calcTempoJuntos(dc.dataInicio)
 const ap1 = dc.apelido1.trim(), ap2 = dc.apelido2.trim()
 if (tempo && ap1 && ap2) return `${ap1} e ${ap2} — ${tempo} juntos`
 if (tempo) return `${tempo} de uma história linda`
 if (ap1 && ap2) return `${ap1} e ${ap2}`
 return 'Uma história de amor'
}

export default function EditarCliente({ pagina }: { pagina: Pagina }) {
 const router = useRouter()
 const [salvando, setSalvando] = useState(false)
 const [excluindo, setExcluindo] = useState(false)
 const [msg, setMsg] = useState('')
 const [erro, setErro] = useState('')

 const [titulo, setTitulo] = useState(pagina.titulo || '')
 const [subtitulo, setSubtitulo] = useState(pagina.subtitulo || '')
 const [mensagem, setMensagem] = useState(pagina.mensagem || '')
 const [corTema, setCorTema] = useState(pagina.cor_tema || 'pink')
 const [fontePar, setFontePar] = useState(pagina.fonte_par || 'classico')
 const [senhaDica, setSenhaDica] = useState(pagina.senha_dica || '')
 const [dadosCasal, setDadosCasal] = useState<DadosCasal>(pagina.dados_casal || {
 nome1: '', nome2: '', dataInicio: '', apelido1: '', apelido2: '',
 cidadePrimeiroEncontro: '', comeFavorita: '', filmeFavorito: '',
 musicaFavorita: '', comoSeConheceram: ''
 })
 const [eventos, setEventos] = useState<Evento[]>(pagina.linha_do_tempo || [])
 const [reloadKey, setReloadKey] = useState(0)

 function updCasal(campo: keyof DadosCasal, valor: string) {
 setDadosCasal(prev => ({ ...prev, [campo]: valor }))
 }
 function addEvento() {
 setEventos(prev => [...prev, { data: '', titulo: '', descricao: '', emoji: '★' }])
 }
 function removeEvento(i: number) {
 setEventos(prev => prev.filter((_, idx) => idx !== i))
 }
 function updEvento(i: number, campo: keyof Evento, valor: string) {
 setEventos(prev => {
 const novo = [...prev]
 novo[i] = { ...novo[i], [campo]: valor }
 return novo
 })
 }

 async function salvar() {
 setSalvando(true)
 setErro('')
 setMsg('')
 try {
 const tituloFinal = titulo.trim() || gerarTituloAuto(pagina.tipo, dadosCasal)
 const subFinal = subtitulo.trim() || gerarSubtituloAuto(pagina.tipo, dadosCasal)
 const res = await fetch(`/api/paginas/${pagina.slug}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 titulo: tituloFinal, subtitulo: subFinal, mensagem,
 cor_tema: corTema, fonte_par: fontePar,
 senha_dica: senhaDica,
 dados_casal: pagina.tipo === 'casal' ? dadosCasal : undefined,
 linha_do_tempo: eventos,
 })
 })
 const data = await res.json()
 if (!res.ok) throw new Error(data.erro || 'Erro')
 setMsg('Salvo com sucesso!')
 if (!titulo.trim()) setTitulo(tituloFinal)
 if (!subtitulo.trim()) setSubtitulo(subFinal)
 setReloadKey(k => k + 1)
 setTimeout(() => setMsg(''), 3000)
 } catch (e) {
 setErro(e instanceof Error ? e.message : 'Erro')
 } finally {
 setSalvando(false)
 }
 }

 async function excluir() {
 if (!confirm(`Excluir "${titulo}" permanentemente? Esta ação não pode ser desfeita.`)) return
 if (!confirm('Tem certeza? Todas as fotos, mensagens e dados serão apagados.')) return
 setExcluindo(true)
 try {
 const res = await fetch(`/api/paginas/${pagina.slug}`, { method: 'DELETE' })
 if (!res.ok) {
 const d = await res.json()
 throw new Error(d.erro || 'Erro')
 }
 router.push('/painel')
 } catch (e) {
 setErro(e instanceof Error ? e.message : 'Erro')
 setExcluindo(false)
 }
 }

 return (
 <div className="min-h-screen bg-[#08080c] text-white">
 {/* Header */}
 <header className="sticky top-0 z-40 bg-[#08080c]/90 backdrop-blur-xl border-b border-white/5">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
 <Link href="/painel" className="p-2 rounded-lg hover:bg-white/5 transition">
 <ArrowLeft className="w-5 h-5" />
 </Link>
 <h1 className="flex-1 font-bold text-sm truncate">Editando: {pagina.titulo}</h1>
 <Link href={`/p/${pagina.slug}`} target="_blank"
 className="text-xs text-zinc-500 hover:text-white transition px-3 py-2">
 Ver
 </Link>
 <button onClick={salvar} disabled={salvando}
 className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#9B1B30] hover:opacity-90 transition disabled:opacity-50 min-h-[44px]">
 <Save className="w-4 h-4" />
 {salvando ? 'Salvando...' : 'Salvar'}
 </button>
 </div>
 </header>

 <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 px-4 sm:px-6 py-6">
 <main className="flex-1 lg:max-w-2xl space-y-8">
 {msg && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm text-center">{msg}</div>}
 {erro && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">{erro}</div>}

 {/* Título + subtítulo */}
 <section className="space-y-3">
 <h2 className="text-lg font-bold">Título</h2>
 {pagina.tipo === 'casal' && (
 <p className="text-xs text-zinc-500">Deixe em branco para gerar automaticamente dos nomes do casal.</p>
 )}
 <input value={titulo} onChange={e => setTitulo(e.target.value)} className={inputClass}
 placeholder={pagina.tipo === 'casal' ? gerarTituloAuto(pagina.tipo, dadosCasal) || 'Título' : 'Título'} />
 <input value={subtitulo} onChange={e => setSubtitulo(e.target.value)} className={inputClass}
 placeholder={pagina.tipo === 'casal' ? gerarSubtituloAuto(pagina.tipo, dadosCasal) || 'Subtítulo' : 'Subtítulo'} />
 </section>

 {/* Casal */}
 {pagina.tipo === 'casal' && (
 <section className="space-y-3">
 <h2 className="text-lg font-bold">Dados do casal</h2>
 <div className="grid grid-cols-2 gap-3">
 <input value={dadosCasal.nome1} onChange={e => updCasal('nome1', e.target.value)} placeholder="Nome 1" className={inputClass} />
 <input value={dadosCasal.nome2} onChange={e => updCasal('nome2', e.target.value)} placeholder="Nome 2" className={inputClass} />
 </div>
 <input type="date" value={dadosCasal.dataInicio} onChange={e => updCasal('dataInicio', e.target.value)} className={inputClass} />
 <div className="grid grid-cols-2 gap-3">
 <input value={dadosCasal.apelido1} onChange={e => updCasal('apelido1', e.target.value)} placeholder="Apelido 1" className={inputClass} />
 <input value={dadosCasal.apelido2} onChange={e => updCasal('apelido2', e.target.value)} placeholder="Apelido 2" className={inputClass} />
 </div>
 <textarea value={dadosCasal.comoSeConheceram} onChange={e => updCasal('comoSeConheceram', e.target.value)}
 placeholder="Como se conheceram..." rows={3} className={`${inputClass} resize-none`} />
 <div className="grid grid-cols-2 gap-3">
 <input value={dadosCasal.cidadePrimeiroEncontro} onChange={e => updCasal('cidadePrimeiroEncontro', e.target.value)} placeholder="Cidade do 1º encontro" className={inputClass} />
 <input value={dadosCasal.comeFavorita} onChange={e => updCasal('comeFavorita', e.target.value)} placeholder="Comida favorita" className={inputClass} />
 </div>
 <input value={dadosCasal.filmeFavorito} onChange={e => updCasal('filmeFavorito', e.target.value)} placeholder="Filme favorito" className={inputClass} />
 </section>
 )}

 {/* Linha do tempo */}
 <section className="space-y-3">
 <h2 className="text-lg font-bold">Linha do tempo</h2>
 {eventos.map((ev, i) => (
 <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
 <div className="flex gap-1.5 flex-wrap">
 {emojisRapidos.map(e => (
 <button key={e} onClick={() => updEvento(i, 'emoji', e)}
 className={`w-7 h-7 rounded-lg text-sm transition ${ev.emoji === e ? 'bg-pink-500/30 ring-1 ring-pink-500' : 'bg-white/5'}`}>
 {e}
 </button>
 ))}
 </div>
 <div className="flex gap-2">
 <input value={ev.data} onChange={e => updEvento(i, 'data', e.target.value)}
 placeholder="Data (ex: Jun 2022)" className={`${inputClass} w-32`} />
 <input value={ev.titulo} onChange={e => updEvento(i, 'titulo', e.target.value)}
 placeholder="Título" className={`${inputClass} flex-1`} />
 <button onClick={() => removeEvento(i)} className="px-3 text-red-400 hover:text-red-300">
 <X className="w-4 h-4" />
 </button>
 </div>
 <textarea value={ev.descricao} onChange={e => updEvento(i, 'descricao', e.target.value)}
 placeholder="Descrição..." rows={2} className={`${inputClass} resize-none`} />
 </div>
 ))}
 <button onClick={addEvento}
 className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition w-full py-3 rounded-xl border border-dashed border-white/10 justify-center">
 <Plus className="w-4 h-4" /> Adicionar momento
 </button>
 </section>

 {/* Mensagem */}
 <section className="space-y-3">
 <h2 className="text-lg font-bold">Mensagem do coração</h2>
 <textarea value={mensagem} onChange={e => setMensagem(e.target.value.slice(0, 600))}
 rows={6} maxLength={600} className={`${inputClass} resize-none`} />
 <p className="text-xs text-zinc-600 text-right">{mensagem.length}/600</p>
 </section>

 {/* Cor */}
 <section className="space-y-3">
 <h2 className="text-lg font-bold">Cor do tema</h2>
 <div className="flex gap-3 flex-wrap">
 {cores.map(c => (
 <button key={c.valor} onClick={() => setCorTema(c.valor)}
 className={`w-10 h-10 rounded-full transition-all ${c.classe} ${corTema === c.valor ? 'ring-2 ring-white ring-offset-2 ring-offset-[#08080c] scale-110' : 'opacity-60 hover:opacity-100'}`} />
 ))}
 </div>
 </section>

 {/* Fonte */}
 <section className="space-y-3">
 <h2 className="text-lg font-bold">Tipografia</h2>
 <div className="grid grid-cols-2 gap-2">
 {paresFonte.map(p => (
 <button key={p.id} onClick={() => setFontePar(p.id)}
 className={`p-3 rounded-xl border text-left transition-all ${fontePar === p.id ? 'border-pink-500 bg-pink-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
 <p className="text-base font-bold text-white" style={{ fontFamily: p.titulo }}>{p.nome}</p>
 </button>
 ))}
 </div>
 </section>

 {/* Senha */}
 <section className="space-y-3">
 <h2 className="text-lg font-bold">Dica da senha</h2>
 <input value={senhaDica} onChange={e => setSenhaDica(e.target.value)}
 placeholder='Ex: "Nossa música favorita"' className={inputClass} />
 </section>

 {/* Excluir */}
 <section className="pt-8 border-t border-white/5">
 <h2 className="text-lg font-bold text-red-400 mb-3">Zona perigosa</h2>
 <p className="text-sm text-zinc-500 mb-4">Excluir esta página apaga todos os dados, fotos e mensagens permanentemente.</p>
 <button onClick={excluir} disabled={excluindo}
 className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-red-300 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition disabled:opacity-50 min-h-[44px]">
 <Trash2 className="w-4 h-4" />
 {excluindo ? 'Excluindo...' : 'Excluir página permanentemente'}
 </button>
 </section>
 </main>

 {/* Prévia ao vivo */}
 <aside className="hidden lg:block w-[380px] shrink-0">
 <div className="sticky top-20">
 <div className="flex items-center justify-between mb-3">
 <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Prévia ao vivo</p>
 <button onClick={() => setReloadKey(k => k + 1)}
 className="text-xs text-zinc-500 hover:text-white transition">
 ↻ Atualizar
 </button>
 </div>
 <div className="rounded-[28px] overflow-hidden border border-white/10 bg-black shadow-2xl"
 style={{ aspectRatio: '9/19.5' }}>
 <iframe key={reloadKey} src={`/p/${pagina.slug}`}
 className="w-full h-full"
 style={{ border: 0 }}
 title="Prévia" />
 </div>
 <p className="text-[11px] text-zinc-600 mt-2 text-center">Clique em "Salvar" e "Atualizar" para ver mudanças</p>
 </div>
 </aside>
 </div>
 </div>
 )
}
