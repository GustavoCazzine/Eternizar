import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const pedidoId = req.nextUrl.searchParams.get('pedidoId')
  if (!pedidoId) return NextResponse.json({ erro: 'pedidoId obrigatório' }, { status: 400 })

  const { data } = await supabaseAdmin()
    .from('pedidos')
    .select('status, pagina_slug')
    .eq('id', pedidoId)
    .single()

  return NextResponse.json({
    status: data?.status || 'pendente',
    slug: data?.pagina_slug || '',
  })
}
