import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimitAsync } from '@/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// âš ï¸ DESATIVADO â€” webhook do Mercado Pago nÃ£o processa mais pedidos.
// Se o MP ainda enviar callbacks (config antiga), respondemos 200 ok
// vazio para evitar retry infinito da parte deles.
const FLUXO_PAGAMENTO_ATIVO = false

// Webhook do Mercado Pago
export async function POST(req: NextRequest) {
  if (!FLUXO_PAGAMENTO_ATIVO) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  // Rate limit webhooks (20/min)
  if (!(await rateLimitAsync(req, 20, 60_000))) {
    return NextResponse.json({ erro: 'Rate limited' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'payment') return NextResponse.json({ ok: true })

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Verificar status do pagamento no MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` }
    })
    const mpData = await mpRes.json()

    if (mpData.status !== 'approved') return NextResponse.json({ ok: true })

    const pedidoId = mpData.metadata?.pedido_id
    if (!pedidoId) return NextResponse.json({ ok: true })

    const supabase = supabaseAdmin()

    const { data: pedido } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .single()

    if (!pedido || pedido.status === 'pago') return NextResponse.json({ ok: true })

    const dados = pedido.dados_pagina

    await supabase.from('paginas').insert({
      slug: dados.slug,
      tipo: pedido.tipo,
      titulo: dados.titulo,
      subtitulo: dados.subtitulo || '',
      mensagem: dados.mensagem,
      musica_nome: dados.musica_nome || '',
      cor_tema: dados.cor_tema || 'pink',
      fotos: dados.fotos || [],
      linha_do_tempo: dados.eventos || [],
      senha_hash: dados.senha_hash || null,
      ativa: true,
      expira_em: dados.expira_em,
      visualizacoes: 0,
      email_cliente: pedido.email_cliente,
      user_id: dados.user_id || null,
    })

    await supabase.from('pedidos').update({
      status: 'pago',
    }).eq('id', pedidoId)

    console.log(`[Webhook] PÃ¡gina criada: /p/${dados.slug}`)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[Webhook]', e instanceof Error ? e.message : 'Unknown')
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
