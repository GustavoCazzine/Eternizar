import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ROTAS_PROTEGIDAS = ['/painel']

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({ request })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Validação ROBUSTA: url precisa existir E começar com http
    if (!url || !key || !url.startsWith('http')) {
      return response
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            })
          )
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname
    if (ROTAS_PROTEGIDAS.some(r => path.startsWith(r)) && !user) {
      const loginUrl = new URL('/entrar', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }

    return response
  } catch (e) {
    console.error('[Middleware]', e instanceof Error ? e.message : 'Unknown')
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: ['/painel/:path*', '/auth/:path*'],
}
