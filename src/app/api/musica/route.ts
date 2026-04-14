import { NextRequest, NextResponse } from 'next/server'
import { rateLimitAsync } from '@/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 15

export interface MusicaResultado {
  id: string
  nome: string
  artista: string
  album: string
  capa: string
  previewUrl: string | null
  duracaoMs: number
}

export async function GET(req: NextRequest) {
  if (!(await rateLimitAsync(req, 30, 60_000))) {
    return NextResponse.json({ erro: 'Muitas requisições.' }, { status: 429 })
  }

  const query = req.nextUrl.searchParams.get('q')
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ resultados: [] })
  }
  if (query.length > 100) {
    return NextResponse.json({ erro: 'Query muito longa.' }, { status: 400 })
  }

  // Timeout 8s — iTunes às vezes trava
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=8&country=BR&lang=pt_BR`
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 }, // 1h cache (resultados de busca não mudam)
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({ resultados: [] })
    }

    const data = await res.json()

    const resultados: MusicaResultado[] = (data.results || []).map((item: Record<string, unknown>) => ({
      id: String(item.trackId),
      nome: (item.trackName as string) || '',
      artista: (item.artistName as string) || '',
      album: (item.collectionName as string) || '',
      capa: ((item.artworkUrl100 as string) || '').replace('100x100', '400x400'),
      previewUrl: (item.previewUrl as string) || null,
      duracaoMs: (item.trackTimeMillis as number) || 0,
    }))

    return NextResponse.json({ resultados }, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' }
    })
  } catch (e) {
    clearTimeout(timeout)
    console.error('[API/musica]', e instanceof Error ? e.message : 'Unknown')
    return NextResponse.json({ resultados: [] })
  }
}
