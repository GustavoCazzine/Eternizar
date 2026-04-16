import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimitAsync, sanitize } from '@/lib/security'
import { getAuthUser } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  if (!(await rateLimitAsync(request, 3, 60_000))) {
    return NextResponse.json({ erro: 'Muitas tentativas.' }, { status: 429 })
  }

  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const slug = sanitize(String(body.slug || ''))

    if (!slug || slug.length > 60 || !/^[a-z0-9-]+$/i.test(slug)) {
      return NextResponse.json({ erro: 'Slug inválido' }, { status: 400 })
    }

    const supabase = supabaseAdmin()

    const { data: pagina, error: errBusca } = await supabase
      .from('paginas')
      .select('id, slug, user_id, hospedagem_vitalicia')
      .eq('slug', slug)
      .single()

    if (errBusca || !pagina) {
      return NextResponse.json({ erro: 'Página não encontrada' }, { status: 404 })
    }

    if (pagina.user_id !== user.id) {
      return NextResponse.json({ erro: 'Sem permissão' }, { status: 403 })
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
