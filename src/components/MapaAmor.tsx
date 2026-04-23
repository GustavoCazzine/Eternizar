'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, MapPin } from 'lucide-react'

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
  fontes: { titulo: string; corpo: string }
}

export default function MapaAmor({ locais, cor, fontes }: Props) {
  const [selecionado, setSelecionado] = useState<number | null>(null)
  const [popupAberto, setPopupAberto] = useState(false)
  const [mapaLiberado, setMapaLiberado] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<Array<{lat: number; lng: number} | null>>([])
  const [mapReady, setMapReady] = useState(false)

  // Geocode
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

  // Init Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstance.current || coords.length === 0) return
    const validCoords = coords.filter(Boolean) as Array<{lat: number; lng: number}>
    if (validCoords.length === 0) return

    async function initMap() {
      const L = (await import('leaflet')).default

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        await new Promise(r => setTimeout(r, 300))
      }

      const center = validCoords[0]
      const map = L.map(mapRef.current!, {
        center: [center.lat, center.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        touchZoom: false,
      })

      // Dark premium tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Custom wine-colored markers
      coords.forEach((c, i) => {
        if (!c) return
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:28px;height:28px;border-radius:50%;
            background:${cor};border:3px solid rgba(255,255,255,0.9);
            box-shadow:0 2px 12px ${cor}80, 0 0 0 4px ${cor}30;
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:bold;color:white;
          ">${i + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })
        const marker = L.marker([c.lat, c.lng], { icon }).addTo(map)
        marker.on('click', () => {
          setSelecionado(i)
          setPopupAberto(true)
        })
        markersRef.current.push(marker)
      })

      if (validCoords.length > 1) {
        const bounds = L.latLngBounds(validCoords.map(c => [c.lat, c.lng]))
        map.fitBounds(bounds, { padding: [50, 50] })
      }

      mapInstance.current = map
      setMapReady(true)
    }

    initMap()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [coords, cor])

  // Fly to selected
  useEffect(() => {
    if (!mapInstance.current || selecionado === null || !coords[selecionado]) return
    const c = coords[selecionado]!
    mapInstance.current.flyTo([c.lat, c.lng], 15, { duration: 1.5 })
  }, [selecionado, coords])

  // Unlock map interaction
  const liberarMapa = useCallback(() => {
    if (!mapInstance.current) return
    setMapaLiberado(true)
    mapInstance.current.dragging.enable()
    mapInstance.current.scrollWheelZoom.enable()
    mapInstance.current.touchZoom.enable()
  }, [])

  function selectCard(i: number) {
    setSelecionado(i)
    // Scroll card into view on mobile
    if (listRef.current) {
      const cards = listRef.current.children
      if (cards[i]) {
        cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }

  const hasCoords = coords.some(Boolean)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Desktop: split-screen | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 rounded-3xl overflow-hidden lg:overflow-visible"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* LEFT — Card list (desktop: vertical scroll, mobile: horizontal carousel at bottom) */}
        <div className="order-2 lg:order-1 lg:w-[35%] lg:relative -mt-16 lg:mt-0 relative z-10">
          <div ref={listRef}
            className="flex lg:flex-col gap-3 p-4 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[480px] scrollbar-hide snap-x lg:snap-none">
            {locais.map((local, i) => (
              <motion.button key={i}
                onClick={() => selectCard(i)}
                whileTap={{ scale: 0.97 }}
                className={`shrink-0 w-56 lg:w-full text-left p-4 rounded-2xl transition-all duration-300 snap-center hover:-translate-y-0.5 ${selecionado === i ? 'ring-1' : ''}`}
                style={{
                  background: selecionado === i ? `${cor}12` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selecionado === i ? cor + '40' : 'rgba(255,255,255,0.06)'}`,
                  ringColor: cor,
                }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: selecionado === i ? cor : `${cor}20`, color: selecionado === i ? 'white' : cor }}>
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: fontes.titulo }}>{local.titulo}</p>
                    {local.endereco && (
                      <p className="text-xs text-zinc-500 mt-0.5 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />{local.endereco}
                      </p>
                    )}
                    {selecionado === i && local.descricao && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        {local.descricao}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* RIGHT — Map */}
        <div className="order-1 lg:order-2 lg:w-[65%] relative">
          <div ref={mapRef}
            className="h-[320px] lg:h-[480px] lg:rounded-2xl overflow-hidden"
            style={{ background: '#1a1a2e' }}>
            {!hasCoords && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: cor, opacity: 0.4 }} />
                  <p className="text-sm text-zinc-600">Carregando mapa...</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: touch to unlock overlay */}
          {mapReady && !mapaLiberado && (
            <button onClick={liberarMapa}
              className="absolute inset-0 z-20 flex items-center justify-center lg:hidden"
              style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="px-5 py-2.5 rounded-full text-xs font-medium text-white/80"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Toque para explorar o mapa
              </div>
            </button>
          )}

          {/* Glassmorphism popup */}
          <AnimatePresence>
            {popupAberto && selecionado !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-4 left-4 right-4 z-30 rounded-2xl p-5 max-w-sm mx-auto"
                style={{
                  background: 'rgba(18,18,18,0.85)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${cor}30`,
                  boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
                }}>
                <button onClick={() => setPopupAberto(false)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white transition"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Photos carousel */}
                {locais[selecionado].fotos && locais[selecionado].fotos!.length > 0 && (
                  <div className="mb-4 rounded-xl overflow-hidden">
                    <PhotoCarousel fotos={locais[selecionado].fotos!} />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: cor, color: 'white' }}>
                    {selecionado + 1}
                  </div>
                  <h3 className="text-base font-bold text-white" style={{ fontFamily: fontes.titulo }}>
                    {locais[selecionado].titulo}
                  </h3>
                </div>
                {locais[selecionado].endereco && (
                  <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{locais[selecionado].endereco}
                  </p>
                )}
                {locais[selecionado].descricao && (
                  <p className="text-sm text-zinc-300 leading-relaxed" style={{ fontFamily: fontes.corpo }}>
                    {locais[selecionado].descricao}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Mini carousel for popup photos
function PhotoCarousel({ fotos }: { fotos: string[] }) {
  const [atual, setAtual] = useState(0)
  if (fotos.length === 0) return null

  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fotos[atual]} alt="" className="w-full aspect-video object-cover rounded-xl" />
      {fotos.length > 1 && (
        <>
          {atual > 0 && (
            <button onClick={() => setAtual(i => i - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-black/50 text-white/70">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {atual < fotos.length - 1 && (
            <button onClick={() => setAtual(i => i + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-black/50 text-white/70">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {fotos.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === atual ? 'white' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
