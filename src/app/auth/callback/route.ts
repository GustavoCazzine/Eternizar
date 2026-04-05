import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// Callback do OAuth (Google) e Magic Link
// Supabase redireciona pra cá após o login
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/painel'

  if (code) {
    const supabase = await createSupabaseServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // Erro: redireciona pro login
  return NextResponse.redirect(`${origin}/entrar?erro=auth`)
}
