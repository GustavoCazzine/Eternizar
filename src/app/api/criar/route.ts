import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  sanitize, sanitizeTexto, gerarSlug, validarEmail,
  validarTipo, validarCor, validarArquivo, validarData,
  parseJsonSeguro, rateLimitAsync
} from '@/lib/security'
import { getAuthUser } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  // â”€â”€â”€ Rate limiting: 5 criações por minuto por IP â”€â”€â”€â”€â”€â”€â”€
  if (!(await rateLimitAsync(req, 5, 60_000))) {
    return NextResponse.json({ erro: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
  }


  // â”€â”€â”€ Verificar usuário autenticado (opcional por agora) â”€â”€â”€â”€â”€
  const user = await getAuthUser(req)
  const userId = user?.id || null
  try {
    const fd = await req.formData()

    // â”€â”€â”€ 1. Extrair e sanitizar campos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const tipo = sanitize(fd.get('tipo') as string || '')
    const titulo = sanitize(fd.get('titulo') as string || '')
    const subtitulo = sanitize(fd.get('subtitulo') as string || '')
    const mensagem = sanitizeTexto(fd.get('mensagem') as string || '', 1000)
    const emailCliente = (fd.get('emailCliente') as string || '').trim().toLowerCase()
    const emailDestinatario = (fd.get('emailDestinatario') as string || '').trim().toLowerCase()
    const corTema = sanitize(fd.get('corTema') as string || 'pink')
    const fontePar = sanitize(fd.get('fontePar') as string || 'classico')
    const compartilhavel = (fd.get('compartilhavel') as string) !== 'false'
    const senhaDica = sanitize(fd.get('senhaDica') as string || '').slice(0, 100)
    const senhaProtegida = (fd.get('senhaProtegida') as string || '').slice(0, 100)

    // â”€â”€â”€ 2. Validação obrigatória â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!tipo || !validarTipo(tipo)) {
      return NextResponse.json({ erro: 'Tipo de página inválido.' }, { status: 400 })
    }
    if (!titulo || titulo.length < 1 || titulo.length > 100) {
      return NextResponse.json({ erro: 'Título inválido (1-100 caracteres).' }, { status: 400 })
    }
    if (!mensagem || mensagem.length < 5 || mensagem.length > 1000) {
      return NextResponse.json({ erro: 'Mensagem inválida (5-1000 caracteres).' }, { status: 400 })
    }
    if (!emailCliente || !validarEmail(emailCliente)) {
      return NextResponse.json({ erro: 'E-mail inválido.' }, { status: 400 })
    }
    if (emailDestinatario && !validarEmail(emailDestinatario)) {
      return NextResponse.json({ erro: 'E-mail do destinatário inválido.' }, { status: 400 })
    }
    if (!validarCor(corTema)) {
      return NextResponse.json({ erro: 'Cor inválida.' }, { status: 400 })
    }

    // â”€â”€â”€ 3. Parse JSON com proteção â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const musica = parseJsonSeguro(fd.get('musica') as string, null)
    const eventos = parseJsonSeguro<Array<Record<string, unknown>>>(fd.get('eventos') as string, [])
    const dadosCasal = parseJsonSeguro<Record<string, string> | null>(fd.get('dadosCasal') as string, null)
    const dadosFormatura = parseJsonSeguro<Record<string, string> | null>(fd.get('dadosFormatura') as string, null)
    const fotosLegendas = parseJsonSeguro<string[]>(fd.get('fotosLegendas') as string, [])

    // â”€â”€â”€ 4. Validar dados específicos do tipo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (tipo === 'casal' && dadosCasal) {
      if (dadosCasal.dataInicio && !validarData(dadosCasal.dataInicio)) {
        return NextResponse.json({ erro: 'Data de início inválida.' }, { status: 400 })
      }
      // Sanitizar campos internos
      if (dadosCasal.nome1) dadosCasal.nome1 = sanitize(dadosCasal.nome1).slice(0, 50)
      if (dadosCasal.nome2) dadosCasal.nome2 = sanitize(dadosCasal.nome2).slice(0, 50)
      if (dadosCasal.apelido1) dadosCasal.apelido1 = sanitize(dadosCasal.apelido1).slice(0, 30)
      if (dadosCasal.apelido2) dadosCasal.apelido2 = sanitize(dadosCasal.apelido2).slice(0, 30)
      if (dadosCasal.comoSeConheceram) dadosCasal.comoSeConheceram = sanitizeTexto(dadosCasal.comoSeConheceram, 500)
    }

    if (tipo === 'formatura' && dadosFormatura) {
      if (dadosFormatura.curso) dadosFormatura.curso = sanitize(dadosFormatura.curso).slice(0, 60)
      if (dadosFormatura.instituicao) dadosFormatura.instituicao = sanitize(dadosFormatura.instituicao).slice(0, 60)
      if (dadosFormatura.anoFormatura) {
        const ano = parseInt(dadosFormatura.anoFormatura)
        if (isNaN(ano) || ano < 1950 || ano > new Date().getFullYear() + 6) {
          return NextResponse.json({ erro: 'Ano de formatura inválido.' }, { status: 400 })
        }
      }
    }

    // â”€â”€â”€ 5. Validar e limitar eventos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const eventosLimpos = (Array.isArray(eventos) ? eventos : []).slice(0, 20).map(ev => ({
      data: sanitize(String(ev.data || '')).slice(0, 30),
      titulo: sanitize(String(ev.titulo || '')).slice(0, 80),
      descricao: sanitizeTexto(String(ev.descricao || ''), 300),
      emoji: String(ev.emoji || '⭐').slice(0, 4),
    })).filter(ev => ev.titulo) // Remove eventos vazios

    // â”€â”€â”€ 6. Validar música â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let musicaLimpa = null
    if (musica && musica.nome) {
      musicaLimpa = {
        nome: sanitize(String(musica.nome)).slice(0, 100),
        artista: sanitize(String(musica.artista || '')).slice(0, 100),
        album: sanitize(String(musica.album || '')).slice(0, 100),
        capa: String(musica.capa || '').slice(0, 500),
        previewUrl: String(musica.previewUrl || '').slice(0, 500),
        duracaoMs: Math.min(Math.max(0, parseInt(musica.duracaoMs) || 0), 600000),
      }
      // Validar URLs
      if (musicaLimpa.capa && !musicaLimpa.capa.startsWith('https://')) musicaLimpa.capa = ''
      if (musicaLimpa.previewUrl && !musicaLimpa.previewUrl.startsWith('https://')) musicaLimpa.previewUrl = ''
    }

    // â”€â”€â”€ 7. Hash da senha â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let senhaHash: string | null = null
    if (senhaProtegida) {
      const encoder = new TextEncoder()
      const data = encoder.encode(senhaProtegida + (process.env.SENHA_SALT || 'eternizar_salt_2026'))
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      senhaHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    }

    const supabase = supabaseAdmin()
    const slug = gerarSlug(titulo)

    // â”€â”€â”€ 8. Upload foto de capa â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let fotoCapa = ''
    const fotoCapaFile = fd.get('fotoCapa') as File | null
    if (fotoCapaFile instanceof File && fotoCapaFile.size > 0) {
      const validacao = validarArquivo(fotoCapaFile)
      if (validacao.ok) {
        const ext = fotoCapaFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const nome = `${slug}/capa-${Date.now()}.${ext}`
        const buffer = await fotoCapaFile.arrayBuffer()
        const { error } = await supabase.storage.from('fotos').upload(nome, buffer, { contentType: fotoCapaFile.type })
        if (!error) {
          const { data } = supabase.storage.from('fotos').getPublicUrl(nome)
          fotoCapa = data.publicUrl
        }
      }
    }

    // â”€â”€â”€ 9. Upload fotos stories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fotosUrls: { url: string; legenda: string; isCapa?: boolean }[] = []
    if (fotoCapa) fotosUrls.push({ url: fotoCapa, legenda: '', isCapa: true })

    const fotos = fd.getAll('fotos') as File[]
    for (let idx = 0; idx < Math.min(fotos.length, 10); idx++) {
      const foto = fotos[idx]
      const validacao = validarArquivo(foto)
      if (!validacao.ok) continue

      const ext = foto.name.split('.').pop()?.toLowerCase() || 'jpg'
      const nome = `${slug}/f${idx}-${Date.now()}.${ext}`
      const buffer = await foto.arrayBuffer()
      const { error } = await supabase.storage.from('fotos').upload(nome, buffer, { contentType: foto.type })
      if (!error) {
        const { data } = supabase.storage.from('fotos').getPublicUrl(nome)
        const legenda = sanitize(fotosLegendas[idx] || '').slice(0, 100)
        fotosUrls.push({ url: data.publicUrl, legenda })
      }
    }

    // â”€â”€â”€ 10. Upload fotos dos eventos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const eventosComFoto = [...eventosLimpos]
    for (let idx = 0; idx < eventosLimpos.length; idx++) {
      const fotoEvento = fd.get(`eventoFoto_${idx}`) as File | null
      if (!fotoEvento || !(fotoEvento instanceof File) || fotoEvento.size === 0) continue
      const validacao = validarArquivo(fotoEvento)
      if (!validacao.ok) continue

      const ext = fotoEvento.name.split('.').pop()?.toLowerCase() || 'jpg'
      const nome = `${slug}/ev${idx}-${Date.now()}.${ext}`
      const buffer = await fotoEvento.arrayBuffer()
      const { error } = await supabase.storage.from('fotos').upload(nome, buffer, { contentType: fotoEvento.type })
      if (!error) {
        const { data } = supabase.storage.from('fotos').getPublicUrl(nome)
        eventosComFoto[idx] = { ...eventosComFoto[idx], fotoUrl: data.publicUrl }
      }
    }

    // â”€â”€â”€ 11. Inserir no banco â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const expiraEm = new Date()
    expiraEm.setDate(expiraEm.getDate() + 60)

    const { error: erroPagina } = await supabase.from('paginas').insert({
      slug,
      tipo,
      titulo,
      subtitulo,
      mensagem,
      musica_nome: musicaLimpa ? `${musicaLimpa.nome} - ${musicaLimpa.artista}` : '',
      musica_dados: musicaLimpa,
      cor_tema: corTema,
      fonte_par: ['classico','moderno','romantico','divertido'].includes(fontePar) ? fontePar : 'classico',
      compartilhavel,
      fotos: fotosUrls,
      linha_do_tempo: eventosComFoto,
      senha_hash: senhaHash,
      senha_dica: senhaDica || null,
      dados_casal: dadosCasal,
      dados_formatura: dadosFormatura,
      ativa: true,
      expira_em: expiraEm.toISOString(),
      visualizacoes: 0,
      email_cliente: emailCliente,
      user_id: userId,
    })

    if (erroPagina) {
      console.error('[API/teste/criar] DB error:', erroPagina.message)
      return NextResponse.json({ erro: 'Erro ao criar página.' }, { status: 500 })
    }

    return NextResponse.json({
      slug,
      url: `/p/${slug}`,
      sucesso: `/sucesso?slug=${slug}&cor=${corTema}&tipo=${tipo}&titulo=${encodeURIComponent(titulo)}&subtitulo=${encodeURIComponent(subtitulo)}&fotoCapa=${encodeURIComponent(fotoCapa)}`,
    })

  } catch (e) {
    console.error('[API/teste/criar] Unexpected:', e)
    return NextResponse.json({ erro: 'Erro interno.' }, { status: 500 })
  }
}
