import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit, sanitize, gerarSlug, validarEmail } from '@/lib/security'
import { getAuthUser } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// âš ï¸ DESATIVADO â€” fluxo de pagamento Mercado Pago nÃ£o estÃ¡ em uso.
// A plataforma foi convertida para free; criaÃ§Ã£o acontece via /api/criar.
// Esta rota Ã© mantida pra eventual reativaÃ§Ã£o de monetizaÃ§Ã£o, mas
// retorna 410 Gone se for chamada acidentalmente.
const FLUXO_PAGAMENTO_ATIVO = false

export async function POST(req: NextRequest) {
  if (!FLUXO_PAGAMENTO_ATIVO) {
    return NextResponse.json(
      { erro: 'Fluxo de pagamento desativado. Use /api/criar.' },
      { status: 410 }
    )
  }

  // Rate limiting: max 5 pedidos por minuto por IP
  if (!rateLimit(req, 5, 60_000)) {
    return NextResponse.json({ erro: 'Muitas requisiÃ§Ãµes. Tente novamente em breve.' }, { status: 429 })
  }

  // Vincular pedido Ã  conta do usuÃ¡rio logado (se houver)
  const authUser = await getAuthUser(req)
  const userId = authUser?.id || null

  try {
    const fd = await req.formData()

    const tipo = sanitize(fd.get('tipo') as string)
    const titulo = sanitize(fd.get('titulo') as string)
    const subtitulo = sanitize(fd.get('subtitulo') as string || '')
    const mensagem = sanitize(fd.get('mensagem') as string)
    const emailCliente = sanitize(fd.get('emailCliente') as string)
    const emailDestinatario = sanitize(fd.get('emailDestinatario') as string || '')
    const corTema = sanitize(fd.get('corTema') as string || 'pink')
    const musicaNome = sanitize(fd.get('musicaNome') as string || '')
    const senhaProtegida = fd.get('senhaProtegida') as string || ''
    const eventosRaw = fd.get('eventos') as string

    // ValidaÃ§Ãµes
    if (!tipo || !titulo || !mensagem || !emailCliente) {
      return NextResponse.json({ erro: 'Campos obrigatÃ³rios faltando.' }, { status: 400 })
    }
    if (!validarEmail(emailCliente)) {
      return NextResponse.json({ erro: 'E-mail invÃ¡lido.' }, { status: 400 })
    }
    if (!['casal', 'formatura', 'homenagem', 'lembrete'].includes(tipo)) {
      return NextResponse.json({ erro: 'Tipo invÃ¡lido.' }, { status: 400 })
    }

    const precos: Record<string, number> = { casal: 29, formatura: 59, homenagem: 29, lembrete: 15 }
    const valor = precos[tipo]
    const slug = gerarSlug(titulo)

    // Parse eventos
    let eventos = []
    try { eventos = JSON.parse(eventosRaw) } catch { eventos = [] }

    // Upload de fotos para Supabase Storage
    const supabase = supabaseAdmin()
    const fotosUrls: string[] = []
    const fotos = fd.getAll('fotos') as File[]

    for (const foto of fotos.slice(0, 10)) {
      if (!(foto instanceof File) || foto.size === 0) continue
      if (foto.size > 10 * 1024 * 1024) continue // max 10MB por foto

      const ext = foto.name.split('.').pop()?.toLowerCase() || 'jpg'
      if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) continue

      const nomeArquivo = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const buffer = await foto.arrayBuffer()

      const { error } = await supabase.storage
        .from('fotos')
        .upload(nomeArquivo, buffer, { contentType: foto.type, upsert: false })

      if (!error) {
        const { data } = supabase.storage.from('fotos').getPublicUrl(nomeArquivo)
        fotosUrls.push(data.publicUrl)
      }
    }

    // Hash da senha se fornecida (simples para MVP)
    let senhaHash = null
    if (senhaProtegida) {
      const encoder = new TextEncoder()
      const data = encoder.encode(senhaProtegida + (process.env.SENHA_SALT || 'eternizar_salt_2026'))
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      senhaHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    }

    // Calcular expiraÃ§Ã£o (60 dias para pÃ¡ginas, 365 para lembrete)
    const diasExpiracao = tipo === 'lembrete' ? 365 : 60
    const expiraEm = new Date()
    expiraEm.setDate(expiraEm.getDate() + diasExpiracao)

    // Criar pedido no banco
    const { data: pedido, error: erroPedido } = await supabase
      .from('pedidos')
      .insert({
        tipo,
        email_cliente: emailCliente,
        status: 'pendente',
        valor,
        dados_pagina: {
          slug,
          titulo,
          subtitulo,
          mensagem,
          email_destinatario: emailDestinatario,
          cor_tema: corTema,
          musica_nome: musicaNome,
          fotos: fotosUrls,
          eventos,
          senha_hash: senhaHash,
          expira_em: expiraEm.toISOString(),
          user_id: userId,
        }
      })
      .select('id')
      .single()

    if (erroPedido) throw new Error('Erro ao criar pedido no banco.')

    return NextResponse.json({ pedidoId: pedido.id, slug })

  } catch (e: unknown) {
    console.error('[API/pedidos]', e instanceof Error ? e.message : 'Unknown error')
    return NextResponse.json({ erro: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
