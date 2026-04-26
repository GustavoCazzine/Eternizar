'use client'

import { useState, useRef, useEffect } from 'react'
import { useCidadeAutocomplete, CidadeResult } from '@/hooks/useCidadeAutocomplete'
import { MapPin } from 'lucide-react'

interface Props {
  value: string
  onSelect: (cidade: CidadeResult) => void
  onChange: (text: string) => void
  className?: string
  placeholder?: string
  cor?: string
}

export default function CidadeInput({ value, onSelect, onChange, className = '', placeholder = 'Comece a digitar a cidade...', cor = '#9B1B30' }: Props) {
  const { resultados, buscando, buscar, limpar } = useCidadeAutocomplete()
  const [aberto, setAberto] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function clickFora(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', clickFora)
    return () => document.removeEventListener('mousedown', clickFora)
  }, [])

  function handleChange(text: string) {
    onChange(text)
    buscar(text)
    setAberto(true)
  }

  function handleSelect(cidade: CidadeResult) {
    onSelect(cidade)
    onChange(cidade.nome)
    limpar()
    setAberto(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${cor}80` }} />
        <input
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => resultados.length > 0 && setAberto(true)}
          placeholder={placeholder}
          className={`pl-10 ${className}`}
          autoComplete="off"
        />
        {buscando && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${cor}40`, borderTopColor: 'transparent' }} />
        )}
      </div>

      {aberto && resultados.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-xl"
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
          {resultados.map((cidade, i) => (
            <button key={i} onClick={() => handleSelect(cidade)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition">
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: cor }} />
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{cidade.nome}</p>
                <p className="text-[10px] text-white/30 tabular-nums">{cidade.lat.toFixed(4)}, {cidade.lng.toFixed(4)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
