import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import PaginaCliente from './PaginaCliente'

export default async function PaginaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = supabaseAdmin()

  const { data: pagina } = await supabase
    .from('paginas')
    .select('*')
    .eq('slug', slug)
    .eq('ativa', true)
    .single()

  if (!pagina) return notFound()

  // Verificar expiração (ignora se hospedagem vitalícia)
  if (!pagina.hospedagem_vitalicia && pagina.expira_em && new Date(pagina.expira_em) < new Date()) {
    return (
      <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center text-center px-4">
        <div>
          <p className="text-6xl mb-6">⏳</p>
          <h1 className="text-2xl font-bold mb-4">Esta página expirou</h1>
          <p className="text-gray-400">O período de exibição desta página chegou ao fim.</p>
        </div>
      </div>
    )
  }

  // Incrementar visualizações (fire and forget)
  supabase.from('paginas').update({ visualizacoes: (pagina.visualizacoes || 0) + 1 }).eq('slug', slug)

  return <PaginaCliente pagina={pagina} />
}
