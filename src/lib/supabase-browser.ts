import { createBrowserClient } from '@supabase/ssr'

// Client para uso no browser (componentes 'use client')
export function createSupabaseBrowser() {
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL
 const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

 if (!url || !key) {
 throw new Error('Supabase env vars missing')
 }

 return createBrowserClient(url, key)
}
