'use client'

import { motion } from 'framer-motion'
import { Heart, Calendar, Music, MessageCircle, Play } from 'lucide-react'

export interface PreviaEvento {
  data: string
  titulo: string
  descricao?: string
  emoji: string
  fotoUrl?: string
}

export interface PreviaDadosCasal {
  nome1: string; nome2: string; dataInicio: string
  apelido1: string; apelido2: string
  cidadePrimeiroEncontro: string; comeFavorita: string
  filmeFavorito: string; comoSeConheceram: string
}

export interface PreviaMusica {
  nome: string; artista: string; album: string; capa: string
}

export interface PreviaPaginaProps {
  tipo: string
  titulo: string
  subtitulo: string
  mensagem: string
  corHex: string
  paleta: { primaria: string; secundaria: string; fundo: string; fundoAlt: string }
  fontes: { titulo: string; corpo: string }
  fotoCapaUrl: string | null
  fotosUrls: (string | null)[]
  fotosLegendas?: string[]
  eventos: PreviaEvento[]
  musica: PreviaMusica | null
  dadosCasal?: PreviaDadosCasal
  compartilhavel?: boolean
}

const paletas: Record<string, { primaria: string; secundaria: string; fundo: string; fundoAlt: string }> = {
  pink:    { primaria: '#B91C3C', secundaria: '#f43f5e', fundo: '#1a0010', fundoAlt: '#2d0018' },
  violet:  { primaria: '#8b5cf6', secundaria: '#7c3aed', fundo: '#0d0020', fundoAlt: '#1e1040' },
  amber:   { primaria: '#f59e0b', secundaria: '#f97316', fundo: '#1a1000', fundoAlt: '#2d1800' },
  blue:    { primaria: '#3b82f6', secundaria: '#06b6d4', fundo: '#000d1a', fundoAlt: '#001830' },
  emerald: { primaria: '#10b981', secundaria: '#14b8a6', fundo: '#001a0d', fundoAlt: '#002d18' },
  rose:    { primaria: '#f43f5e', secundaria: '#B91C3C', fundo: '#1a0008', fundoAlt: '#2d0010' },
}

export function getPaleta(cor: string) {
  return paletas[cor] || paletas.pink
}

const paresFonteMap: Record<string, { titulo: string; corpo: string }> = {
  classico:  { titulo: 'var(--font-cormorant)', corpo: 'var(--font-outfit)' },
  moderno:   { titulo: 'var(--font-space)', corpo: 'var(--font-inter)' },
  romantico: { titulo: 'var(--font-playfair)', corpo: 'var(--font-outfit)' },
  divertido: { titulo: 'var(--font-caveat)', corpo: 'var(--font-inter)' },
}

export function getFontes(par: string) {
  return paresFonteMap[par] || paresFonteMap.classico
}

function calcTempo(dataInicio: string) {
  if (!dataInicio) return null
  const inicio = new Date(dataInicio)
  const agora = new Date()
  const diff = agora.getTime() - inicio.getTime()
  if (diff <= 0) return null
  const segundosTotal = Math.floor(diff / 1000)
  const minutosTotal = Math.floor(segundosTotal / 60)
  const horasTotal = Math.floor(minutosTotal / 60)
  const diasTotal = Math.floor(horasTotal / 24)
  const anos = Math.floor(diasTotal / 365)
  const meses = Math.floor((diasTotal % 365) / 30)
  const dias = diasTotal % 30
  return { anos, meses, dias }
}

// ─── Prévia fiel — renderiza versão reduzida da página real ──────
export default function PreviaPagina(props: PreviaPaginaProps) {
  const {
    tipo, titulo, subtitulo, mensagem, corHex, paleta, fontes,
    fotoCapaUrl, fotosUrls, fotosLegendas = [], eventos, musica, dadosCasal, compartilhavel = true,
  } = props

  const totalFotos = fotosUrls.filter(Boolean).length
  const eventosValidos = eventos.filter(e => e.titulo)
  const tempo = dadosCasal?.dataInicio ? calcTempo(dadosCasal.dataInicio) : null

  return (
    <div
      className="rounded-[24px] overflow-hidden border border-white/10 shadow-2xl select-none"
      style={{ background: '#08080c', fontFamily: fontes.corpo }}
    >
      <div className="aspect-[9/16] w-full overflow-y-auto preview-scroll" style={{ scrollbarWidth: 'thin' }}>

        {/* ===== HERO ===== */}
        <div className="relative min-h-[100%] flex flex-col items-center justify-center px-4 py-8 overflow-hidden"
          style={{
            background: fotoCapaUrl
              ? `linear-gradient(to bottom, ${paleta.fundoAlt}99 0%, ${paleta.fundo}dd 50%, #08080c 100%)`
              : `radial-gradient(ellipse at 50% 30%, ${paleta.fundoAlt}, #08080c)`
          }}
        >
          {fotoCapaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoCapaUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 -z-10" />
          )}

          {/* glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none"
            style={{ background: corHex }} />

          <motion.div className="relative z-10">
            <Heart className="w-8 h-8 fill-current mb-3" style={{ color: corHex, filter: `drop-shadow(0 0 12px ${corHex}80)` }} />
          </motion.div>

          <p className="text-[8px] uppercase tracking-[0.2em] mb-2 font-medium relative z-10" style={{ color: corHex }}>
            Uma surpresa especial
          </p>
          <h1 className="text-2xl font-black leading-[1.05] text-center text-white nome-capitalize relative z-10 px-2"
            style={{ fontFamily: fontes.titulo, textShadow: fotoCapaUrl ? '0 2px 12px rgba(0,0,0,0.8)' : 'none' }}>
            {titulo || <span className="text-white/30">Título</span>}
          </h1>
          {subtitulo && (
            <p className="text-[10px] text-gray-300 mt-2 nome-capitalize text-center relative z-10 px-2"
              style={{ textShadow: fotoCapaUrl ? '0 1px 8px rgba(0,0,0,0.6)' : 'none' }}>
              {subtitulo}
            </p>
          )}
        </div>

        {/* ===== CONTADOR (casal) ===== */}
        {tipo === 'casal' && tempo && (
          <div className="px-4 py-6" style={{ background: `linear-gradient(180deg, #08080c, ${paleta.fundo}, #08080c)` }}>
            <p className="text-[8px] uppercase tracking-[0.2em] mb-2 font-medium text-center" style={{ color: corHex }}>
              Juntos há
            </p>
            <h2 className="text-base font-black mb-3 text-white text-center" style={{ fontFamily: fontes.titulo }}>
              Cada segundo conta
            </h2>
            <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
              {[
                { l: 'Anos', v: tempo.anos },
                { l: 'Meses', v: tempo.meses },
                { l: 'Dias', v: tempo.dias },
              ].map(item => (
                <div key={item.l} className="text-center py-2 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${corHex}18, ${corHex}08)`,
                    border: `1px solid ${corHex}25`,
                  }}>
                  <p className="text-base font-black text-white leading-none">{String(item.v).padStart(2, '0')}</p>
                  <p className="text-[7px] text-gray-500 mt-1 uppercase tracking-wider">{item.l}</p>
                </div>
              ))}
            </div>

            {/* Cards extras */}
            {dadosCasal && (dadosCasal.cidadePrimeiroEncontro || dadosCasal.comeFavorita || dadosCasal.filmeFavorito) && (
              <div className="space-y-1.5 mt-4 max-w-[200px] mx-auto">
                {[
                  { e: '📍', l: 'Onde começou', v: dadosCasal.cidadePrimeiroEncontro },
                  { e: '🍕', l: 'Comida favorita', v: dadosCasal.comeFavorita },
                  { e: '🎬', l: 'Filme favorito', v: dadosCasal.filmeFavorito },
                ].filter(i => i.v).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0"
                      style={{ background: `${corHex}20` }}>{item.e}</div>
                    <div className="min-w-0">
                      <p className="text-[6px] uppercase tracking-wider truncate" style={{ color: `${corHex}99` }}>{item.l}</p>
                      <p className="text-[9px] font-semibold text-white truncate">{item.v}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== STORIES ===== */}
        {totalFotos > 0 && (
          <div className="px-4 py-6">
            <p className="text-[8px] uppercase tracking-[0.2em] mb-2 font-medium text-center" style={{ color: corHex }}>
              Memórias
            </p>
            <h2 className="text-base font-black mb-3 text-white text-center" style={{ fontFamily: fontes.titulo }}>
              Nossos momentos
            </h2>
            <div className="flex gap-2 justify-center flex-wrap">
              {fotosUrls.slice(0, 6).map((url, i) => url && (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="p-[1.5px] rounded-full" style={{ background: `linear-gradient(135deg, ${corHex}, ${paleta.secundaria})` }}>
                    <div className="p-[1.5px] rounded-full bg-[#08080c]">
                      <div className="w-9 h-9 rounded-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  {fotosLegendas[i] && (
                    <p className="text-[6px] text-gray-500 truncate max-w-[40px] text-center">{fotosLegendas[i]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== COMO SE CONHECERAM ===== */}
        {tipo === 'casal' && dadosCasal?.comoSeConheceram && (
          <div className="px-4 py-5">
            <p className="text-[8px] uppercase tracking-[0.2em] mb-2 font-medium text-center" style={{ color: corHex }}>
              A nossa história
            </p>
            <div className="text-2xl font-serif select-none text-center" style={{ color: `${corHex}40`, lineHeight: 0.5 }}>“</div>
            <p className="text-[10px] text-gray-300 leading-relaxed italic text-center px-1 break-words">
              {dadosCasal.comoSeConheceram.length > 140
                ? dadosCasal.comoSeConheceram.slice(0, 140) + '...'
                : dadosCasal.comoSeConheceram}
            </p>
            <div className="text-2xl font-serif select-none text-right" style={{ color: `${corHex}40`, lineHeight: 0.5 }}>”</div>
          </div>
        )}

        {/* ===== TIMELINE ===== */}
        {eventosValidos.length > 0 && (
          <div className="px-4 py-6" style={{ background: `linear-gradient(180deg, #08080c, ${paleta.fundo} 50%, #08080c)` }}>
            <p className="text-[8px] uppercase tracking-[0.2em] mb-2 font-medium text-center" style={{ color: corHex }}>
              Nossa história
            </p>
            <h2 className="text-base font-black mb-4 text-white text-center" style={{ fontFamily: fontes.titulo }}>
              Linha do tempo
            </h2>
            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-px"
                style={{ background: `linear-gradient(to bottom, transparent, ${corHex}80 10%, ${corHex}80 90%, transparent)` }} />
              <div className="space-y-3">
                {eventosValidos.slice(0, 4).map((ev, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-8 top-0 w-6 h-6 rounded-lg flex items-center justify-center text-[12px] shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${corHex}, ${paleta.secundaria})` }}>
                      {ev.emoji || '⭐'}
                    </div>
                    {ev.data && (
                      <p className="text-[7px] inline-block px-1.5 py-0.5 rounded-full mb-1"
                        style={{ background: `${corHex}18`, border: `1px solid ${corHex}30`, color: `${corHex}cc` }}>
                        {ev.data}
                      </p>
                    )}
                    <p className="text-[10px] font-bold text-white leading-tight break-words">{ev.titulo}</p>
                    {ev.descricao && (
                      <p className="text-[8px] text-gray-400 leading-snug mt-0.5 break-words">
                        {ev.descricao.length > 60 ? ev.descricao.slice(0, 60) + '...' : ev.descricao}
                      </p>
                    )}
                  </div>
                ))}
                {eventosValidos.length > 4 && (
                  <p className="text-[8px] text-gray-600 text-center pt-2">+{eventosValidos.length - 4} momentos</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== MÚSICA ===== */}
        {musica && (
          <div className="px-4 py-6">
            <p className="text-[8px] uppercase tracking-[0.2em] mb-2 font-medium text-center" style={{ color: corHex }}>
              Nossa música
            </p>
            <div className="rounded-xl overflow-hidden max-w-[160px] mx-auto border border-white/10"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              {musica.capa && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={musica.capa} alt="" className="w-full aspect-square object-cover" />
              )}
              <div className="p-2">
                <p className="text-[10px] font-bold text-white truncate">{musica.nome}</p>
                <p className="text-[8px] text-gray-500 truncate">{musica.artista}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: corHex }}>
                    <Play className="w-2.5 h-2.5 text-white ml-0.5 fill-current" />
                  </div>
                  <div className="flex-1 h-0.5 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MENSAGEM FINAL ===== */}
        {mensagem && (
          <div className="px-4 py-8 min-h-[180px] flex flex-col items-center justify-center"
            style={{ background: `radial-gradient(ellipse at center bottom, ${paleta.fundoAlt}, #08080c)` }}>
            <div className="text-2xl mb-2">💌</div>
            <div className="text-3xl font-serif select-none leading-none" style={{ color: `${corHex}20` }}>"</div>
            <p className="text-[10px] text-gray-200 leading-relaxed font-light text-center px-3 my-1 break-words"
              style={{ fontFamily: fontes.corpo }}>
              {mensagem.length > 160 ? mensagem.slice(0, 160) + '...' : mensagem}
            </p>
            <div className="text-3xl font-serif select-none leading-none text-right w-full pr-3" style={{ color: `${corHex}20` }}>"</div>
            <Heart className="w-5 h-5 fill-current mt-2" style={{ color: corHex }} />
          </div>
        )}

        {/* ===== GUESTBOOK preview ===== */}
        {compartilhavel && (
          <div className="px-4 py-5" style={{ background: `linear-gradient(180deg, #08080c, ${paleta.fundo}, #08080c)` }}>
            <p className="text-[8px] uppercase tracking-[0.2em] mb-2 font-medium text-center" style={{ color: corHex }}>
              Deixe sua marca
            </p>
            <h2 className="text-sm font-black mb-3 text-white text-center flex items-center justify-center gap-1.5"
              style={{ fontFamily: fontes.titulo }}>
              <MessageCircle className="w-3 h-3" style={{ color: corHex }} />
              Livro de Visitas
            </h2>
            <div className="rounded-lg p-2 max-w-[180px] mx-auto"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="h-1.5 rounded bg-white/10 mb-1.5" />
              <div className="h-4 rounded bg-white/10" />
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="py-3 text-center border-t border-white/5">
          <p className="text-[8px] text-gray-700">Criado com Eternizar</p>
        </div>
      </div>

      <style jsx>{`
        .preview-scroll::-webkit-scrollbar { width: 4px; }
        .preview-scroll::-webkit-scrollbar-track { background: transparent; }
        .preview-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  )
}
