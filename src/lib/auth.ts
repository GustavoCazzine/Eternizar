import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Verifica se o request tem um usuário autenticado
// Retorna o user ou null (NUNCA confia no frontend)
// NUNCA lança exceção — se falhar, retorna null
export async function getAuthUser(req: NextRequest) {
 try {
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL
 const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

 // Validação robusta
 if (!url || !key || !url.startsWith('http')) return null

 const supabase = createServerClient(url, key, {
 cookies: {
 getAll() {
 return req.cookies.getAll()
 },
 setAll() {
 // Route handlers não precisam setar cookies aqui
 },
 },
 })

 const { data: { user }, error } = await supabase.auth.getUser()
 if (error || !user) return null
 return user
 } catch {
 return null
 }
}
