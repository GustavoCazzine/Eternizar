import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Client para uso em Server Components e Route Handlers
export async function createSupabaseServer() {
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL
 const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

 if (!url || !key || !url.startsWith('http')) {
 throw new Error('Supabase env vars inválidas ou ausentes')
 }

 const cookieStore = await cookies()

 return createServerClient(url, key, {
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
 // Server Components são read-only, ignorar
 }
 },
 },
 })
}
