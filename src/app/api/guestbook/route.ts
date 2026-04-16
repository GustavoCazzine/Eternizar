import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimitAsync, sanitize, sanitizeTexto } from '@/lib/security'
import { getAuthUser } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// GET â€” busca mensagens (apenas aprovadas, exceto se for o dono)
export async function GET(request: NextRequest) {
  if (!(await rateLimitAsync(request, 30, 60_000))) {
    return NextResponse.json({ erro: 'Muitas requisições.' }, { status: 429 })
  }

  const slug = sanitize(request.nextUrl.searchParams.get('slug') || '')
  if (!slug || slug.length > 60) {
    return NextResponse.json({ erro: 'Slug inválido' }, { status: 400 })
  }

  const supabase = supabaseAdmin()

  // Verifica se quem pede é o dono
  const user = await getAuthUser(request)
  let ehDono = false
  if (user) {
    const { data: pag } = await supabase
      .from('paginas')
      .select('user_id')
      .eq('slug', slug)
      .maybeSingle()
    ehDono = pag?.user_id === user.id
  }

  let query = supabase
    .from('mensagens_visita')
    .select('id, nome, mensagem, created_at, aprovado')
    .eq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(100)

  if (!ehDono) query = query.eq('aprovado', true)

  const { data, error } = await query

  if (error) return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })

  return NextResponse.json({ mensagens: data || [], ehDono })
}

// POST â€” nova mensagem (entra como pendente)
export async function POST(request: NextRequest) {
  if (!(await rateLimitAsync(request, 5, 60_000))) {
    return NextResponse.json({ erro: 'Muitas mensagens. Aguarde.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const slug = sanitize(String(body.slug || ''))
    const nome = sanitize(String(body.nome || '')).slice(0, 50)
    const mensagem = sanitizeTexto(String(body.mensagem || ''), 300)

    if (!slug || slug.length > 60) return NextResponse.json({ erro: 'Slug inválido' }, { status: 400 })
    if (!nome || nome.length < 1) return NextResponse.json({ erro: 'Nome obrigatório' }, { status: 400 })
    if (!mensagem || mensagem.length < 1) return NextResponse.json({ erro: 'Mensagem obrigatória' }, { status: 400 })

    const supabase = supabaseAdmin()

    const { data: pagina } = await supabase
      .from('paginas')
      .select('slug, user_id')
      .eq('slug', slug)
      .eq('ativa', true)
      .maybeSingle()

    if (!pagina) return NextResponse.json({ erro: 'Página não encontrada' }, { status: 404 })

    const cincoMinAtras = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('mensagens_visita')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug)
      .gte('created_at', cincoMinAtras)

    if (count && count >= 10) {
      return NextResponse.json({ erro: 'Limite de mensagens atingido. Tente em alguns minutos.' }, { status: 429 })
    }

    const { data, error } = await supabase
      .from('mensagens_visita')
      .insert({ slug, nome, mensagem, aprovado: false, pagina_user_id: pagina.user_id })
      .select('id, nome, mensagem, created_at, aprovado')
      .single()

    if (error) return NextResponse.json({ erro: 'Erro ao salvar' }, { status: 500 })

    return NextResponse.json({ sucesso: true, mensagem: data, pendente: true })
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

// PATCH â€” aprovar/rejeitar (somente dono)
export async function PATCH(request: NextRequest) {
  if (!(await rateLimitAsync(request, 30, 60_000))) {
    return NextResponse.json({ erro: 'Muitas requisições.' }, { status: 429 })
  }

  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const id = String(body.id || '')
    const aprovar = Boolean(body.aprovar)

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
    }

    const supabase = supabaseAdmin()

    // Verifica dono
    const { data: msg } = await supabase
      .from('mensagens_visita')
      .select('id, slug')
      .eq('id', id)
      .maybeSingle()

    if (!msg) return NextResponse.json({ erro: 'Mensagem não encontrada' }, { status: 404 })

    const { data: pag } = await supabase
      .from('paginas')
      .select('user_id')
      .eq('slug', msg.slug)
      .maybeSingle()

    if (!pag || pag.user_id !== user.id) {
      return NextResponse.json({ erro: 'Sem permissão' }, { status: 403 })
    }

    const { error } = await supabase
      .from('mensagens_visita')
      .update({ aprovado: aprovar })
      .eq('id', id)

    if (error) return NextResponse.json({ erro: 'Erro ao atualizar' }, { status: 500 })

    return NextResponse.json({ sucesso: true })
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

// DELETE â€” remove mensagem (somente dono)
export async function DELETE(request: NextRequest) {
  if (!(await rateLimitAsync(request, 30, 60_000))) {
    return NextResponse.json({ erro: 'Muitas requisições.' }, { status: 429 })
  }

  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id') || ''
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ erro: 'ID inválido' }, { status: 400 })
  }

  const supabase = supabaseAdmin()

  const { data: msg } = await supabase
    .from('mensagens_visita')
    .select('id, slug')
    .eq('id', id)
    .maybeSingle()

  if (!msg) return NextResponse.json({ erro: 'Não encontrada' }, { status: 404 })

  const { data: pag } = await supabase
    .from('paginas')
    .select('user_id')
    .eq('slug', msg.slug)
    .maybeSingle()

  if (!pag || pag.user_id !== user.id) {
    return NextResponse.json({ erro: 'Sem permissão' }, { status: 403 })
  }

  const { error } = await supabase
    .from('mensagens_visita')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ erro: 'Erro ao deletar' }, { status: 500 })

  return NextResponse.json({ sucesso: true })
}
