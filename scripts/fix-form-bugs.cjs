const fs = require('fs');
let c = fs.readFileSync('src/app/criar/page.tsx', 'utf8');

// ===== 1. REMOVE FONT SELECTOR UI =====
// Remove the entire Tipografia section from PassoDetalhes
const tipoStart = c.indexOf('{/* Tipografia */}');
if (tipoStart !== -1) {
  const tipoEnd = c.indexOf('</div>\n </div>', tipoStart);
  if (tipoEnd !== -1) {
    c = c.slice(0, tipoStart) + c.slice(tipoEnd + 14);
    console.log('1a. Font selector UI: REMOVED');
  }
} else {
  console.log('1a. Font selector: NOT FOUND');
}

// Hardcode fontePar to 'classico' in initial state (keep the field for backward compat)
// Already defaults to 'classico', just remove the paresFonte array
const paresFonteStart = c.indexOf('const paresFonte = [');
if (paresFonteStart !== -1) {
  const paresFonteEnd = c.indexOf(']\n', paresFonteStart) + 2;
  c = c.slice(0, paresFonteStart) + '// Fonts hardcoded: Playfair Display (titles) + Inter (body)\n' + c.slice(paresFonteEnd);
  console.log('1b. paresFonte array: REMOVED');
}

// Remove the fontTitulo variable that uses paresFonte
c = c.replace(/const fontTitulo = fontes\[form\.fontePar\] \|\| fontes\.classico\n/g, '');
c = c.replace(/const fontes: Record<string, string> = \{[^}]+\}\n/g, '');
console.log('1c. fontTitulo variable: cleaned');

// ===== 2. FIX CidadeInput — add validation state =====
// Rewrite CidadeInput with strict selection required
const cidadeInput = `'use client'

import { useState, useRef, useEffect } from 'react'
import { useCidadeAutocomplete, CidadeResult } from '@/hooks/useCidadeAutocomplete'
import { MapPin, Check, Loader2 } from 'lucide-react'

interface Props {
  value: string
  onSelect: (cidade: CidadeResult) => void
  onChange: (text: string) => void
  className?: string
  placeholder?: string
  cor?: string
  required?: boolean
}

export default function CidadeInput({ value, onSelect, onChange, className = '', placeholder = 'Comece a digitar a cidade...', cor = '#9B1B30', required = false }: Props) {
  const { resultados, buscando, buscar, limpar } = useCidadeAutocomplete()
  const [aberto, setAberto] = useState(false)
  const [selecionado, setSelecionado] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function clickFora(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', clickFora)
    return () => document.removeEventListener('mousedown', clickFora)
  }, [])

  function handleChange(text: string) {
    onChange(text)
    setSelecionado(false)
    buscar(text)
    setAberto(true)
  }

  function handleSelect(cidade: CidadeResult) {
    onSelect(cidade)
    onChange(cidade.nome)
    setSelecionado(true)
    limpar()
    setAberto(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: selecionado ? '#22c55e' : \`\${cor}80\` }} />
        <input
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => resultados.length > 0 && setAberto(true)}
          placeholder={placeholder}
          className={\`pl-10 pr-8 \${className}\`}
          autoComplete="off"
        />
        {buscando && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-zinc-500" />}
        {selecionado && !buscando && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
      </div>

      {value && !selecionado && !buscando && resultados.length === 0 && value.length >= 3 && (
        <p className="text-[10px] mt-1" style={{ color: \`\${cor}aa\` }}>Selecione uma cidade da lista para salvar as coordenadas.</p>
      )}

      {aberto && resultados.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-xl"
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
          {resultados.map((cidade, i) => (
            <button key={i} onClick={() => handleSelect(cidade)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition">
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: cor }} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{cidade.nome}</p>
              </div>
              <span className="text-[9px] text-white/20 tabular-nums shrink-0">{cidade.lat.toFixed(2)}, {cidade.lng.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
`;
fs.writeFileSync('src/components/CidadeInput.tsx', cidadeInput, 'utf8');
console.log('2. CidadeInput: REWRITTEN with validation');

// ===== 3. Add Loader2 to lucide imports if missing =====
if (!c.includes('Loader2')) {
  // Not needed in the form itself, only in CidadeInput component
}

fs.writeFileSync('src/app/criar/page.tsx', c, 'utf8');
console.log('\nAll fixes applied.');
