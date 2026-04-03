// Tipos principais do projeto Eternizar

export type TipoPagina = 'casal' | 'formatura' | 'aniversario' | 'homenagem'

export interface Pagina {
  id: string
  slug: string
  tipo: TipoPagina
  titulo: string
  subtitulo?: string
  mensagem: string
  musica_url?: string
  musica_nome?: string
  cor_tema: string
  fotos: Foto[]
  linha_do_tempo: Evento[]
  ativa: boolean
  expira_em: string
  criada_em: string
  visualizacoes: number
  senha?: string // hash bcrypt
}

export interface Foto {
  id: string
  url: string
  legenda?: string
  ordem: number
}

export interface Evento {
  id: string
  data: string
  titulo: string
  descricao?: string
  emoji?: string
}

export interface Lembrete {
  id: string
  email: string
  data: string // MM-DD
  descricao: string
  ativo: boolean
}

export interface Pedido {
  id: string
  tipo: TipoPagina
  email_cliente: string
  status: 'pendente' | 'pago' | 'criado' | 'expirado'
  valor: number
  pagina_id?: string
  criado_em: string
}
