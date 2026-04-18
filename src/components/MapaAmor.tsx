'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface Local {
  titulo: string
  descricao: string
  endereco: string
  lat?: number
  lng?: number
  fotos?: string[]
}

interface Props {
  locais: Local[]
  cor: string
}

// Componente preparado para Mapbox GL
// Para ativar: npm i mapbox-gl && setar NEXT_PUBLIC_MAPBOX_TOKEN no .env
export default function MapaAmor({ locais, cor }: Props) {
  const [selecionado, setSelecionado] = useState<number | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const hasToken = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Fallback sem mapa: lista elegante de locais
  return (
    <div className="max-w-4xl mx-auto">
      {/* Layout split no desktop */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de locais */}
        <div className="lg:w-2/5 space-y-3">
          {locais.map((local, i) => (
            <button key={i} onClick={() => setSelecionado(i === selecionado ? null : i)}
              className={`w-full text-left p-4 rounded-2xl transition-all ${selecionado === i ? 'ring-1' : ''}`}
              style={{
                background: selecionado === i ? `${cor}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selecionado === i ? cor + '40' : 'rgba(255,255,255,0.08)'}`,
                ringColor: cor,
              }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${cor}20`, color: cor }}>
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{local.titulo}</p>
                  {local.endereco && <p className="text-xs text-zinc-500 truncate">{local.endereco}</p>}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Area do mapa / detalhe */}
        <div className="lg:w-3/5">
          {selecionado !== null ? (
            <div className="rounded-2xl p-6 h-full min-h-[300px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: `${cor}20`, color: cor }}>
                  {selecionado + 1}
                </div>
                <h3 className="text-lg font-bold text-white">{locais[selecionado].titulo}</h3>
              </div>
              {locais[selecionado].endereco && (
                <p className="text-sm text-zinc-400 mb-3">{locais[selecionado].endereco}</p>
              )}
              {locais[selecionado].descricao && (
                <p className="text-sm text-zinc-300 leading-relaxed">{locais[selecionado].descricao}</p>
              )}
              {/* Placeholder para mapa */}
              <div ref={mapRef} className="mt-4 rounded-xl overflow-hidden h-48 flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p className="text-xs text-zinc-600">Mapa em breve</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl h-full min-h-[300px] flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <p className="text-sm text-zinc-600">Selecione um local para ver detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
