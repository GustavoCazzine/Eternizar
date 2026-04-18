'use client'

import { useRef, useState, useEffect } from 'react'

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

export default function MapaAmor({ locais, cor }: Props) {
  const [selecionado, setSelecionado] = useState<number | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<unknown>(null)
  const [mapReady, setMapReady] = useState(false)

  // Geocode addresses to coordinates using Nominatim (free, no key)
  const [coords, setCoords] = useState<Array<{lat: number; lng: number} | null>>([])

  useEffect(() => {
    async function geocode() {
      const results = await Promise.all(
        locais.map(async (local) => {
          if (local.lat && local.lng) return { lat: local.lat, lng: local.lng }
          if (!local.endereco) return null
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(local.endereco)}&limit=1`,
              { headers: { 'User-Agent': 'Eternizar/1.0' } }
            )
            const data = await res.json()
            if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
          } catch {}
          return null
        })
      )
      setCoords(results)
    }
    geocode()
  }, [locais])

  // Load Leaflet dynamically
  useEffect(() => {
    if (!mapRef.current || mapInstance.current || coords.length === 0) return
    const validCoords = coords.filter(Boolean) as Array<{lat: number; lng: number}>
    if (validCoords.length === 0) return

    async function initMap() {
      // @ts-expect-error dynamic import
      const L = (await import('leaflet')).default

      // Add CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      const center = validCoords[0]
      const map = L.map(mapRef.current!, {
        center: [center.lat, center.lng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      })

      // Dark mode tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Custom markers
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;border-radius:50%;background:${cor};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      coords.forEach((c, i) => {
        if (!c) return
        const marker = L.marker([c.lat, c.lng], { icon }).addTo(map)
        marker.on('click', () => setSelecionado(i))
      })

      // Fit bounds
      if (validCoords.length > 1) {
        const bounds = L.latLngBounds(validCoords.map(c => [c.lat, c.lng]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }

      mapInstance.current = map
      setMapReady(true)
    }

    initMap()
  }, [coords, cor])

  // Fly to selected
  useEffect(() => {
    if (!mapInstance.current || selecionado === null || !coords[selecionado]) return
    const c = coords[selecionado]!
    // @ts-expect-error leaflet map
    mapInstance.current.flyTo([c.lat, c.lng], 15, { duration: 1.5 })
  }, [selecionado, coords])

  const hasCoords = coords.some(Boolean)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Lista */}
        <div className="lg:w-2/5 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:max-h-[420px] lg:overflow-y-auto scrollbar-hide">
          {locais.map((local, i) => (
            <button key={i} onClick={() => setSelecionado(i === selecionado ? null : i)}
              className={`shrink-0 w-64 lg:w-full text-left p-4 rounded-2xl transition-all ${selecionado === i ? 'ring-1' : ''}`}
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
              {selecionado === i && local.descricao && (
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">{local.descricao}</p>
              )}
            </button>
          ))}
        </div>

        {/* Mapa */}
        <div className="lg:w-3/5">
          <div ref={mapRef}
            className="rounded-2xl overflow-hidden h-[300px] lg:h-[420px]"
            style={{
              background: hasCoords ? undefined : 'rgba(255,255,255,0.02)',
              border: hasCoords ? undefined : '1px dashed rgba(255,255,255,0.08)',
            }}>
            {!hasCoords && (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-sm text-zinc-600">Carregando mapa...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
