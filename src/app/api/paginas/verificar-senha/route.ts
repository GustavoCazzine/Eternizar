import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimitAsync, sanitize } from '@/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  // Rate limit: 10 tentativas por minuto
  if (!(await rateLimitAsync(request, 10, 60_000))) {
    return NextResponse.json({ erro: 'Muitas tentativas. Aguarde.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const slug = sanitize(String(body.slug || ''))
    const senha = String(body.senha || '')

    if (!slug || !senha) {
      return NextResponse.json({ erro: 'Slug e senha obrigatórios' }, { status: 400 })
    }
    if (slug.length > 60 || senha.length > 100) {
      return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 })
    }

    const supabase = supabaseAdmin()

    const { data: pagina, error } = await supabase
      .from('paginas')
      .select('senha_hash')
      .eq('slug', slug)
      .single()

    if (error || !pagina) {
      return NextResponse.json({ erro: 'Página não encontrada' }, { status: 404 })
    }

    if (!pagina.senha_hash) {
      return NextResponse.json({ liberada: true })
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(senha + (process.env.SENHA_SALT || 'eternizar_salt_2026'))
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const senhaHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (senhaHash === pagina.senha_hash) {
      return NextResponse.json({ liberada: true })
    }

    return NextResponse.json({ erro: 'Senha incorreta' }, { status: 401 })
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
