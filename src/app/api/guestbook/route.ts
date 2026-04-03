import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit, sanitize, sanitizeTexto } from '@/lib/security'

// GET — busca mensagens
export async function GET(request: NextRequest) {
  if (!rateLimit(request, 30, 60_000)) {
    return NextResponse.json({ erro: 'Muitas requisições.' }, { status: 429 })
  }

  const slug = sanitize(request.nextUrl.searchParams.get('slug') || '')
  if (!slug || slug.length > 60) {
    return NextResponse.json({ erro: 'Slug inválido' }, { status: 400 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('mensagens_visita')
    .select('id, nome, mensagem, created_at')
    .eq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }

  return NextResponse.json({ mensagens: data || [] })
}

// POST — nova mensagem
export async function POST(request: NextRequest) {
  if (!rateLimit(request, 5, 60_000)) {
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

    // Verificar se a página existe
    const { data: pagina } = await supabase
      .from('paginas')
      .select('slug')
      .eq('slug', slug)
      .eq('ativa', true)
      .single()

    if (!pagina) return NextResponse.json({ erro: 'Página não encontrada' }, { status: 404 })

    // Rate limit por slug
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
      .insert({ slug, nome, mensagem })
      .select('id, nome, mensagem, created_at')
      .single()

    if (error) return NextResponse.json({ erro: 'Erro ao salvar' }, { status: 500 })

    return NextResponse.json({ sucesso: true, mensagem: data })
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
