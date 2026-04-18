import { createSupabaseServer } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import PainelCliente from './PainelCliente'

// Página 100% dinâmica — depende do cookie de sessão, nunca pré-renderizar
export const dynamic = 'force-dynamic'

export default async function PainelPage() {
 const supabase = await createSupabaseServer()
 const { data: { user } } = await supabase.auth.getUser()

 if (!user) redirect('/entrar?redirect=/painel')

 // Buscar páginas do usuário via admin (bypassa RLS)
 const admin = supabaseAdmin()
 const { data: paginas } = await admin
 .from('paginas')
 .select('slug, tipo, titulo, subtitulo, cor_tema, ativa, visualizacoes, created_at, hospedagem_vitalicia, expira_em, fotos')
 .eq('user_id', user.id)
 .order('created_at', { ascending: false })

 return (
 <PainelCliente
 user={{ id: user.id, email: user.email || '', nome: user.user_metadata?.full_name || user.user_metadata?.name || '', avatar: user.user_metadata?.avatar_url || '' }}
 paginas={paginas || []}
 />
 )
}
