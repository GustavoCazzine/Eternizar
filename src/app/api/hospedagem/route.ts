import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit, sanitize } from '@/lib/security'

export async function POST(request: NextRequest) {
  if (!rateLimit(request, 3, 60_000)) {
    return NextResponse.json({ erro: 'Muitas tentativas.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const slug = sanitize(String(body.slug || ''))

    if (!slug || slug.length > 60) {
      return NextResponse.json({ erro: 'Slug inválido' }, { status: 400 })
    }

    const supabase = supabaseAdmin()

    const { data: pagina, error: errBusca } = await supabase
      .from('paginas')
      .select('id, slug, hospedagem_vitalicia')
      .eq('slug', slug)
      .single()

    if (errBusca || !pagina) {
      return NextResponse.json({ erro: 'Página não encontrada' }, { status: 404 })
    }

    if (pagina.hospedagem_vitalicia) {
      return NextResponse.json({ erro: 'Já está ativa' }, { status: 400 })
    }

    const { error } = await supabase
      .from('paginas')
      .update({ hospedagem_vitalicia: true, expira_em: null })
      .eq('slug', slug)

    if (error) return NextResponse.json({ erro: 'Erro ao ativar' }, { status: 500 })
    return NextResponse.json({ sucesso: true })
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
