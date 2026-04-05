import { createBrowserClient } from '@supabase/ssr'

// Client para uso no browser (componentes 'use client')
// Usa cookies automaticamente para manter a sessão
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
