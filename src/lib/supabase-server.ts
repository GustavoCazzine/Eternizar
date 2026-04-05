import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Client para uso em Server Components e Route Handlers
// Lê/escreve cookies httpOnly para sessão segura
export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Pode falhar em Server Components (read-only)
            // Funciona em Route Handlers e Server Actions
          }
        },
      },
    }
  )
}
