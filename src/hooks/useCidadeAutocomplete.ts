'use client'

import { useState, useRef, useCallback } from 'react'

export interface CidadeResult {
  nome: string
  lat: number
  lng: number
  displayName: string
}

export function useCidadeAutocomplete() {
  const [resultados, setResultados] = useState<CidadeResult[]>([])
  const [buscando, setBuscando] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const buscar = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query || query.length < 3) { setResultados([]); return }

    debounceRef.current = setTimeout(async () => {
      setBuscando(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=br`,
          { headers: { 'User-Agent': 'Eternizar/1.0', 'Accept-Language': 'pt-BR' } }
        )
        if (!res.ok) throw new Error('Nominatim failed')
        const data = await res.json()

        const cidades: CidadeResult[] = data
          .filter((r: any) => r.type === 'city' || r.type === 'town' || r.type === 'village' || r.class === 'place')
          .map((r: any) => {
            const addr = r.address || {}
            const cidade = addr.city || addr.town || addr.village || r.name || ''
            const estado = addr.state || ''
            const sigla = estadoParaSigla(estado)
            return {
              nome: sigla ? `${cidade}, ${sigla}` : cidade,
              lat: parseFloat(r.lat),
              lng: parseFloat(r.lon),
              displayName: sigla ? `${cidade}, ${sigla}` : r.display_name?.split(',').slice(0, 2).join(','),
            }
          })

        setResultados(cidades)
      } catch {
        setResultados([])
      } finally {
        setBuscando(false)
      }
    }, 400)
  }, [])

  const limpar = useCallback(() => setResultados([]), [])

  return { resultados, buscando, buscar, limpar }
}

function estadoParaSigla(estado: string): string {
  const map: Record<string, string> = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapa': 'AP', 'Amazonas': 'AM',
    'Bahia': 'BA', 'Ceara': 'CE', 'Distrito Federal': 'DF', 'Espirito Santo': 'ES',
    'Goias': 'GO', 'Maranhao': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG', 'Para': 'PA', 'Paraiba': 'PB', 'Parana': 'PR',
    'Pernambuco': 'PE', 'Piaui': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS', 'Rondonia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
    'Sao Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
  }
  return map[estado] || ''
}
