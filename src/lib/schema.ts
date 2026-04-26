// Schema de dados do Eternizar
// Modelo canônico para formulário, API e banco de dados

// ===== TIPOS DO FORMULÁRIO (client-side) =====

export interface CidadeGeo {
  nome: string
  lat: number
  lng: number
}

export interface LocalMapa {
  titulo: string
  descricao: string
  endereco: string
  lat?: number
  lng?: number
  fotos?: string[]
}

export interface EventoTimeline {
  data: string
  titulo: string
  descricao: string
  emoji: string
  foto: File | null
  fotoUrl?: string
}

export interface BucketItem {
  texto: string
  feito: boolean
}

export interface DadosCasal {
  nome1: string
  nome2: string
  dataInicio: string           // ISO date YYYY-MM-DD
  apelido1: string
  apelido2: string
  cidadeOrigem: CidadeGeo | null  // Geocodificado via Nominatim
  cidadePrimeiroEncontro: string  // Fallback texto livre (legado)
  comeFavorita: string
  filmeFavorito: string
  musicaFavorita: string
  comoSeConheceram: string
}

export interface DadosFormatura {
  curso: string
  instituicao: string
  anoFormatura: string
  nomeTurma: string
  quantidadeAlunos: string
  casaisFormados: string
}

export interface MusicaSelecionada {
  nome: string
  artista: string
  album: string
  capa: string
  previewUrl: string | null
  duracaoMs: number
}

export interface FormularioCompleto {
  tipo: 'casal' | 'formatura' | 'homenagem'
  titulo: string
  subtitulo: string
  mensagem: string
  emailCliente: string
  emailDestinatario: string
  corTema: string
  fontePar: string
  compartilhavel: boolean
  fotoCapa: File | null
  musica: MusicaSelecionada | null
  fotos: Array<{ file: File; legenda: string }>
  eventos: EventoTimeline[]
  senhaProtegida: string
  senhaDica: string
  dadosCasal: DadosCasal
  dadosFormatura: DadosFormatura
  bucketList: BucketItem[]
  locais: LocalMapa[]
  audioMensagem: File | null
}

// ===== TIPOS DO BANCO DE DADOS (Supabase) =====

export interface PaginaDB {
  id: string
  slug: string
  tipo: 'casal' | 'formatura' | 'homenagem'
  titulo: string
  subtitulo: string | null
  mensagem: string
  cor_tema: string
  fonte_par: string
  compartilhavel: boolean
  senha_hash: string | null
  senha_dica: string | null
  foto_capa: string | null
  musica_dados: MusicaSelecionada | null
  dados_casal: DadosCasal | null
  dados_formatura: DadosFormatura | null
  fotos: Array<{ url: string; legenda?: string; isCapa?: boolean }>
  linha_do_tempo: Array<{
    data: string
    titulo: string
    descricao?: string
    emoji: string
    fotoUrl?: string
  }>
  locais: LocalMapa[]
  bucket_list: BucketItem[]
  audio_mensagem: string | null
  email_cliente: string
  email_destinatario: string | null
  visualizacoes: number
  criado_em: string           // ISO timestamp
  expira_em: string | null    // ISO timestamp
  hospedagem_vitalicia: boolean
  user_id: string
}

// ===== VALIDAÇÃO (regras de negócio) =====

export const VALIDATION = {
  nome: { min: 1, max: 50 },
  apelido: { max: 30 },
  titulo: { min: 1, max: 100 },
  mensagem: { min: 1, max: 600 },
  senha: { min: 4, max: 20 },
  senhaDica: { max: 100 },
  descricaoEvento: { max: 300 },
  descricaoLocal: { max: 200 },
  comoSeConheceram: { max: 500 },
  bucketItemTexto: { max: 100 },
  maxFotos: 10,
  maxEventos: 20,
  maxLocais: 10,
  maxBucketItems: 20,
  maxFotoSizeMB: 4,
  maxAudioSizeMB: 10,
  audioFormatos: ['mp3', 'm4a', 'wav', 'ogg', 'webm', 'aac'],
} as const

export function validarFormulario(form: FormularioCompleto): string | null {
  if (!form.tipo) return 'Escolha um tipo de homenagem.'
  if (!form.mensagem || form.mensagem.length < VALIDATION.mensagem.min)
    return 'Ops! Faltou escrever a mensagem do coracao.'
  if (form.mensagem.length > VALIDATION.mensagem.max)
    return `A mensagem pode ter no maximo ${VALIDATION.mensagem.max} caracteres.`

  if (form.tipo === 'casal') {
    if (!form.dadosCasal.nome1 || !form.dadosCasal.nome2)
      return 'Preencha os nomes do casal.'
    if (!form.dadosCasal.dataInicio)
      return 'Qual a data que tudo comecou?'
    const dt = new Date(form.dadosCasal.dataInicio)
    if (isNaN(dt.getTime()) || dt > new Date())
      return 'A data precisa ser valida e no passado.'
  }

  if (form.tipo === 'formatura') {
    if (!form.dadosFormatura.curso)
      return 'Qual o curso da formatura?'
  }

  if (form.eventos.length > VALIDATION.maxEventos)
    return `Maximo de ${VALIDATION.maxEventos} momentos na timeline.`
  if (form.locais.length > VALIDATION.maxLocais)
    return `Maximo de ${VALIDATION.maxLocais} locais no mapa.`
  if (form.bucketList.length > VALIDATION.maxBucketItems)
    return `Maximo de ${VALIDATION.maxBucketItems} itens na bucket list.`

  if (form.senhaProtegida && form.senhaProtegida.length < VALIDATION.senha.min)
    return `Para manter o segredo seguro, use pelo menos ${VALIDATION.senha.min} caracteres!`

  return null
}

// ===== DEFAULTS =====

export const DEFAULT_DADOS_CASAL: DadosCasal = {
  nome1: '', nome2: '', dataInicio: '', apelido1: '', apelido2: '',
  cidadeOrigem: null, cidadePrimeiroEncontro: '',
  comeFavorita: '', filmeFavorito: '', musicaFavorita: '', comoSeConheceram: '',
}

export const DEFAULT_DADOS_FORMATURA: DadosFormatura = {
  curso: '', instituicao: '', anoFormatura: '', nomeTurma: '',
  quantidadeAlunos: '', casaisFormados: '',
}

export const DEFAULT_FORMULARIO: FormularioCompleto = {
  tipo: 'casal',
  titulo: '', subtitulo: '', mensagem: '',
  emailCliente: '', emailDestinatario: '',
  corTema: 'pink', fontePar: 'classico', compartilhavel: true,
  fotoCapa: null, musica: null,
  fotos: [],
  eventos: [{ data: '', titulo: '', descricao: '', emoji: '\u2665', foto: null }],
  senhaProtegida: '', senhaDica: '',
  dadosCasal: { ...DEFAULT_DADOS_CASAL },
  dadosFormatura: { ...DEFAULT_DADOS_FORMATURA },
  bucketList: [],
  locais: [],
  audioMensagem: null,
}
