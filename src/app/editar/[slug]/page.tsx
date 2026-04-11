import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import EditarCliente from './EditarCliente'

export const dynamic = 'force-dynamic'

export default async function EditarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/entrar?redirect=/editar/${slug}`)

  const admin = supabaseAdmin()
  const { data: pagina } = await admin
    .from('paginas')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!pagina) redirect('/painel')
  if (pagina.user_id !== user.id) redirect('/painel')

  return <EditarCliente pagina={pagina} />
}
