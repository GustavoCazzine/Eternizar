'use client'

import PaginaCliente from '@/app/p/[slug]/PaginaCliente'

// Dados de exemplo para a demo
const paginaDemo = {
  slug: 'demo-pedro-ana',
  tipo: 'casal',
  titulo: 'Pedro & Ana',
  subtitulo: 'Amor e Lindinha — juntos há mais de 3 anos 🥂',
  mensagem: 'Cada segundo ao seu lado é o meu dia favorito. Obrigado por fazer parte da minha vida, por me fazer sorrir mesmo nos dias difíceis, e por ser exatamente quem você é.',
  musica_nome: 'Perfect - Ed Sheeran',
  musica_dados: {
    nome: 'Perfect',
    artista: 'Ed Sheeran',
    album: '÷ (Divide)',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a0/4d/c4/a04dc484-03cc-02aa-fa82-5334fcb4bc16/190295851286.jpg/400x400cc.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/a0/55/55/a05555c0-d9fc-00f3-0a14-3d5765e53271/mzaf_8515316732254498962.plus.aac.p.m4a',
    duracaoMs: 263000,
  },
  cor_tema: 'pink',
  fotos: [
    { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800', legenda: 'Nossa primeira foto juntos', isCapa: true },
    { url: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800', legenda: 'Aquela viagem inesquecível' },
    { url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800', legenda: 'Momentos assim não têm preço' },
    { url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800', legenda: 'Nosso pôr do sol favorito' },
  ],
  linha_do_tempo: [
    { data: 'Jun 2022', titulo: 'O dia que tudo mudou', descricao: 'Nos conhecemos na faculdade. Ela estava perto da janela, lendo, e eu não conseguia parar de olhar.', emoji: '🌹' },
    { data: 'Ago 2022', titulo: 'Primeiro beijo', descricao: 'Depois de um jantar especial, debaixo das estrelas. O coração disparou.', emoji: '❤️' },
    { data: 'Jan 2023', titulo: 'Primeira viagem', descricao: 'Fomos juntos para o litoral. Três dias que pareceram uma vida inteira.', emoji: '✈️' },
    { data: 'Jun 2023', titulo: 'Um ano juntos', descricao: 'Celebramos com o mesmo restaurante do primeiro encontro.', emoji: '🎉' },
  ],
  senha_hash: null,
  senha_dica: null,
  dados_casal: {
    nome1: 'Pedro',
    nome2: 'Ana',
    dataInicio: '2022-06-14',
    apelido1: 'Amor',
    apelido2: 'Lindinha',
    cidadePrimeiroEncontro: 'São Paulo',
    comeFavorita: 'Pizza de calabresa',
    filmeFavorito: 'La La Land',
    musicaFavorita: 'Perfect',
    comoSeConheceram: 'Nos conhecemos na faculdade, em uma tarde de quinta-feira que mudou tudo. Ela estava sentada perto da janela, lendo, e eu não conseguia parar de olhar. Foi o início da melhor história da minha vida.',
  },
  dados_formatura: null,
}

export default function DemoPage() {
  return <PaginaCliente pagina={paginaDemo} />
}
