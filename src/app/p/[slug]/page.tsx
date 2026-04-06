import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import PaginaCliente from './PaginaCliente'

// Página dinâmica — depende do slug e precisa incrementar contador
export const dynamic = 'force-dynamic'

// Incrementa visualizações de forma segura.
// Tenta RPC (atômica, sem race condition); se não existir, faz update comum.
// NUNCA lança — falha silenciosa pra não quebrar o render da página.
async function incrementarVisualizacao(slug: string, atual: number) {
  try {
    const supabase = supabaseAdmin()
    // Tenta RPC primeiro (criar no Supabase com: CREATE FUNCTION incrementar_visualizacao...)
    const { error: rpcError } = await supabase.rpc('incrementar_visualizacao', { p_slug: slug })
    if (!rpcError) return

    // Fallback: update direto (com race condition aceitável — é só contador)
    await supabase
      .from('paginas')
      .update({ visualizacoes: (atual || 0) + 1 })
      .eq('slug', slug)
  } catch (e) {
    console.error('[incrementarVisualizacao]', e instanceof Error ? e.message : 'unknown')
  }
}

export default async function PaginaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Validação básica do slug (evita query com lixo)
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

  // Erro de conexão com Supabase — deixa o error.tsx capturar
  if (error) {
    console.error('[PaginaPage] DB error:', error.message)
    throw new Error('Erro ao carregar página')
  }

  if (!pagina) return notFound()

  // Verificar expiração (ignora se hospedagem vitalícia)
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

  // Incrementar visualizações — await de verdade, mas nunca lança.
  // Impacto no TTFB é ~50ms; aceitável pra ter contador real.
  await incrementarVisualizacao(slug, pagina.visualizacoes)

  return <PaginaCliente pagina={pagina} />
}
