import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { after } from 'next/server'
import type { Metadata } from 'next'
import PaginaCliente from './PaginaCliente'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function incrementarVisualizacao(slug: string, atual: number) {
  try {
    const supabase = supabaseAdmin()
    const { error: rpcError } = await supabase.rpc('incrementar_visualizacao', { p_slug: slug })
    if (!rpcError) return
    await supabase
      .from('paginas')
      .update({ visualizacoes: (atual || 0) + 1 })
      .eq('slug', slug)
  } catch (e) {
    console.error('[incrementarVisualizacao]', e instanceof Error ? e.message : 'unknown')
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params
    if (!slug || !/^[a-z0-9-]+$/i.test(slug)) return { title: 'Eternizar' }
    const supabase = supabaseAdmin()
    const { data } = await supabase
      .from('paginas')
      .select('titulo, subtitulo, fotos')
      .eq('slug', slug)
      .eq('ativa', true)
      .maybeSingle()
    if (!data) return { title: 'Eternizar' }
    const capa = (data.fotos as Array<{ url: string; isCapa?: boolean }> | null)?.find(f => f.isCapa)?.url
    return {
      title: `${data.titulo} | Eternizar`,
      description: data.subtitulo || 'Uma homenagem especial criada com Eternizar',
      openGraph: {
        title: data.titulo,
        description: data.subtitulo || 'Uma homenagem especial',
        images: capa ? [capa] : [],
        type: 'website',
      },
      twitter: { card: 'summary_large_image', title: data.titulo, images: capa ? [capa] : [] },
      robots: { index: false, follow: false },
    }
  } catch {
    return { title: 'Eternizar' }
  }
}

export default async function PaginaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!slug || slug.length > 80 || !/^[a-z0-9-]+$/i.test(slug)) {
    return notFound()
  }

  const supabase = supabaseAdmin()

  const { data: pagina, error } = await supabase
    .from('paginas')
    .select('*')
    .eq('slug', slug)
    .eq('ativa', true)
    .maybeSingle()

  if (error) {
    console.error('[PaginaPage] DB error:', error.message)
    throw new Error('Erro ao carregar página')
  }

  if (!pagina) return notFound()

  const expirada =
    !pagina.hospedagem_vitalicia &&
    pagina.expira_em &&
    new Date(pagina.expira_em) < new Date()

  if (expirada) {
    return (
      <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center text-center px-4">
        <div className="max-w-sm">
          <p className="text-5xl mb-5">⏳</p>
          <h1 className="text-2xl font-bold mb-3">Esta página expirou</h1>
          <p className="text-zinc-500 text-sm">
            O período de exibição desta homenagem chegou ao fim.
          </p>
        </div>
      </div>
    )
  }

  // Incremento NÃO bloqueia render — roda após resposta enviada
  after(() => incrementarVisualizacao(slug, pagina.visualizacoes))

  return <PaginaCliente pagina={pagina} />
}
