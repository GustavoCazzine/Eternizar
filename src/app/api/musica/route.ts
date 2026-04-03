import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/security'

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
  if (!rateLimit(req, 30, 60_000)) {
    return NextResponse.json({ erro: 'Muitas requisições.' }, { status: 429 })
  }

  const query = req.nextUrl.searchParams.get('q')
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ resultados: [] })
  }

  try {
    // iTunes Search API — gratuita, sem chave, retorna preview de 30s + capa
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=8&country=BR&lang=pt_BR`
    const res = await fetch(url, { next: { revalidate: 60 } })
    const data = await res.json()

    const resultados: MusicaResultado[] = (data.results || []).map((item: Record<string, unknown>) => ({
      id: String(item.trackId),
      nome: item.trackName as string,
      artista: item.artistName as string,
      album: item.collectionName as string,
      capa: ((item.artworkUrl100 as string) || '').replace('100x100', '400x400'),
      previewUrl: (item.previewUrl as string) || null,
      duracaoMs: (item.trackTimeMillis as number) || 0,
    }))

    return NextResponse.json({ resultados })
  } catch (e) {
    console.error('[API/musica]', e instanceof Error ? e.message : 'Unknown error')
    return NextResponse.json({ erro: 'Erro ao buscar músicas.' }, { status: 500 })
  }
}
