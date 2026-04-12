import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import { rateLimit, sanitize, sanitizeTexto, validarCor, parseJsonSeguro } from '@/lib/security'

// PATCH — editar campos da página (somente dono)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!rateLimit(request, 20, 60_000)) {
    return NextResponse.json({ erro: 'Muitas requisições.' }, { status: 429 })
  }

  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  const { slug } = await params
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json({ erro: 'Slug inválido' }, { status: 400 })
  }

  const supabase = supabaseAdmin()

  const { data: pag } = await supabase
    .from('paginas')
    .select('user_id')
    .eq('slug', slug)
    .maybeSingle()

  if (!pag) return NextResponse.json({ erro: 'Página não encontrada' }, { status: 404 })
  if (pag.user_id !== user.id) return NextResponse.json({ erro: 'Sem permissão' }, { status: 403 })

  try {
    const body = await request.json()
    const update: Record<string, unknown> = {}

    if (typeof body.titulo === 'string') update.titulo = sanitize(body.titulo).slice(0, 100)
    if (typeof body.subtitulo === 'string') update.subtitulo = sanitize(body.subtitulo).slice(0, 200)
    if (typeof body.mensagem === 'string') update.mensagem = sanitizeTexto(body.mensagem, 1000)
    if (typeof body.cor_tema === 'string' && validarCor(body.cor_tema)) update.cor_tema = body.cor_tema
    if (typeof body.fonte_par === 'string' && ['classico','moderno','romantico','divertido'].includes(body.fonte_par)) {
      update.fonte_par = body.fonte_par
    }
    if (typeof body.compartilhavel === 'boolean') update.compartilhavel = body.compartilhavel
    if (typeof body.senha_dica === 'string') update.senha_dica = sanitize(body.senha_dica).slice(0, 100) || null
    if (body.dados_casal && typeof body.dados_casal === 'object') {
      const dc = body.dados_casal as Record<string, string>
      const limpo: Record<string, string> = {}
      for (const k of ['nome1','nome2','dataInicio','apelido1','apelido2','cidadePrimeiroEncontro','comeFavorita','filmeFavorito','musicaFavorita','comoSeConheceram']) {
        if (typeof dc[k] === 'string') limpo[k] = sanitize(dc[k]).slice(0, 200)
      }
      update.dados_casal = limpo
    }
    if (Array.isArray(body.linha_do_tempo)) {
      update.linha_do_tempo = body.linha_do_tempo.slice(0, 20).map((ev: Record<string, unknown>) => ({
        data: sanitize(String(ev.data || '')).slice(0, 30),
        titulo: sanitize(String(ev.titulo || '')).slice(0, 80),
        descricao: sanitizeTexto(String(ev.descricao || ''), 300),
        emoji: String(ev.emoji || '⭐').slice(0, 4),
        fotoUrl: typeof ev.fotoUrl === 'string' ? ev.fotoUrl.slice(0, 500) : undefined,
      })).filter((e: { titulo: string }) => e.titulo)
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ erro: 'Nada pra atualizar' }, { status: 400 })
    }

    const { error } = await supabase
      .from('paginas')
      .update(update)
      .eq('slug', slug)

    if (error) return NextResponse.json({ erro: 'Erro ao atualizar' }, { status: 500 })

    return NextResponse.json({ sucesso: true })
  } catch {
    return NextResponse.json({ erro: 'Payload inválido' }, { status: 400 })
  }
}

// DELETE — excluir página + arquivos (somente dono)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!rateLimit(request, 10, 60_000)) {
    return NextResponse.json({ erro: 'Muitas requisições.' }, { status: 429 })
  }

  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  const { slug } = await params
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json({ erro: 'Slug inválido' }, { status: 400 })
  }

  const supabase = supabaseAdmin()

  const { data: pag } = await supabase
    .from('paginas')
    .select('user_id')
    .eq('slug', slug)
    .maybeSingle()

  if (!pag) return NextResponse.json({ erro: 'Página não encontrada' }, { status: 404 })
  if (pag.user_id !== user.id) return NextResponse.json({ erro: 'Sem permissão' }, { status: 403 })

  // Lista arquivos no bucket
  const { data: arquivos } = await supabase.storage.from('fotos').list(slug)
  if (arquivos && arquivos.length > 0) {
    const paths = arquivos.map(a => `${slug}/${a.name}`)
    await supabase.storage.from('fotos').remove(paths)
  }

  // Deleta mensagens do guestbook
  await supabase.from('mensagens_visita').delete().eq('slug', slug)

  // Deleta a página
  const { error } = await supabase.from('paginas').delete().eq('slug', slug)

  if (error) return NextResponse.json({ erro: 'Erro ao deletar' }, { status: 500 })

  return NextResponse.json({ sucesso: true })
}

// GET — busca pra editar (somente dono)
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  const { slug } = await params
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json({ erro: 'Slug inválido' }, { status: 400 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('paginas')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return NextResponse.json({ erro: 'Não encontrada' }, { status: 404 })
  if (data.user_id !== user.id) return NextResponse.json({ erro: 'Sem permissão' }, { status: 403 })

  return NextResponse.json({ pagina: data })
}
