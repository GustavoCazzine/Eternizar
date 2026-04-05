import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Verifica se o request tem um usuário autenticado
// Retorna o user ou null (NUNCA confia no frontend)
export async function getAuthUser(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll() {
          // Route handlers não precisam setar cookies aqui
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}
