import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// âš ï¸ DESATIVADO â€” fluxo de pagamento Mercado Pago nÃ£o estÃ¡ em uso.
const FLUXO_PAGAMENTO_ATIVO = false

export async function POST(req: NextRequest) {
  if (!FLUXO_PAGAMENTO_ATIVO) {
    return NextResponse.json(
      { erro: 'Fluxo de pagamento desativado.' },
      { status: 410 }
    )
  }

  if (!rateLimit(req, 10, 60_000)) {
    return NextResponse.json({ erro: 'Muitas requisiÃ§Ãµes.' }, { status: 429 })
  }

  try {
    const { pedidoId } = await req.json()
    if (!pedidoId) return NextResponse.json({ erro: 'pedidoId obrigatÃ³rio.' }, { status: 400 })

    const supabase = supabaseAdmin()

    // Buscar pedido
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .single()

    if (error || !pedido) return NextResponse.json({ erro: 'Pedido nÃ£o encontrado.' }, { status: 404 })
    if (pedido.status === 'pago') return NextResponse.json({ erro: 'Pedido jÃ¡ pago.' }, { status: 400 })

    // Criar pagamento no Mercado Pago
    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': pedidoId,
      },
      body: JSON.stringify({
        transaction_amount: pedido.valor,
        description: `Eternizar - ${pedido.tipo}`,
        payment_method_id: 'pix',
        payer: { email: pedido.email_cliente },
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pagamento/webhook`,
        metadata: { pedido_id: pedidoId },
      })
    })

    const mpData = await mpRes.json()
    if (!mpRes.ok) throw new Error('Erro ao criar pagamento no MP')

    const qrCode = mpData.point_of_interaction?.transaction_data?.qr_code
    const qrCodeBase64 = mpData.point_of_interaction?.transaction_data?.qr_code_base64

    // Salvar payment_id no pedido
    await supabase.from('pedidos').update({
      payment_id: String(mpData.id),
      status: 'pendente'
    }).eq('id', pedidoId)

    return NextResponse.json({
      qrCode,
      qrCodeBase64,
      valor: pedido.valor,
      slug: pedido.dados_pagina?.slug,
      pedidoId,
    })

  } catch (e) {
    console.error('[API/pagamento/gerar]', e instanceof Error ? e.message : 'Unknown error')
    return NextResponse.json({ erro: 'Erro ao gerar pagamento.' }, { status: 500 })
  }
}
