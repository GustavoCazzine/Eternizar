import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// âš ï¸ DESATIVADO â€” polling de pagamento nÃ£o estÃ¡ em uso pois o fluxo
// Mercado Pago foi desativado. Mantido pra quando reativarmos.
const FLUXO_PAGAMENTO_ATIVO = false

// Polling de status do pedido de pagamento.
// Retorna status + slug (lido de dados_pagina.slug, nÃ£o de pagina_slug).
export async function GET(req: NextRequest) {
  if (!FLUXO_PAGAMENTO_ATIVO) {
    return NextResponse.json(
      { erro: 'Fluxo de pagamento desativado.' },
      { status: 410 }
    )
  }

  if (!rateLimit(req, 60, 60_000)) {
    return NextResponse.json({ erro: 'Muitas requisiÃ§Ãµes.' }, { status: 429 })
  }

  const pedidoId = req.nextUrl.searchParams.get('pedidoId')
  if (!pedidoId) {
    return NextResponse.json({ erro: 'pedidoId obrigatÃ³rio' }, { status: 400 })
  }

  // ValidaÃ§Ã£o bÃ¡sica de UUID (evita queries com lixo)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pedidoId)) {
    return NextResponse.json({ erro: 'pedidoId invÃ¡lido' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from('pedidos')
      .select('status, dados_pagina')
      .eq('id', pedidoId)
      .maybeSingle()

    if (error) {
      console.error('[API/pagamento/status]', error.message)
      return NextResponse.json({ erro: 'Erro ao consultar pedido' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ erro: 'Pedido nÃ£o encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      status: data.status || 'pendente',
      slug: data.dados_pagina?.slug || '',
    })
  } catch (e) {
    console.error('[API/pagamento/status]', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
