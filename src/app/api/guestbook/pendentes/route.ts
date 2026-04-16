import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import { rateLimit } from '@/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  if (!rateLimit(request, 30, 60_000)) {
    return NextResponse.json({ erro: 'Muitas requisições.' }, { status: 429 })
  }

  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  const supabase = supabaseAdmin()

  const { data: paginas } = await supabase
    .from('paginas')
    .select('slug, titulo')
    .eq('user_id', user.id)

  if (!paginas || paginas.length === 0) {
    return NextResponse.json({ pendentes: [], total: 0 })
  }

  const slugs = paginas.map(p => p.slug)

  const { data: msgs } = await supabase
    .from('mensagens_visita')
    .select('id, slug, nome, mensagem, created_at, aprovado')
    .in('slug', slugs)
    .eq('aprovado', false)
    .order('created_at', { ascending: false })
    .limit(200)

  const titulos: Record<string, string> = {}
  paginas.forEach(p => { titulos[p.slug] = p.titulo })

  const pendentes = (msgs || []).map(m => ({
    ...m,
    pagina_titulo: titulos[m.slug] || m.slug,
  }))

  return NextResponse.json({ pendentes, total: pendentes.length })
}
