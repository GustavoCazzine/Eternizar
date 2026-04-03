'use client'
// EmojiAnimado: renderiza o emoji nativamente com animação CSS leve.
// Não usa Lottie (URLs externas quebravam em produção).

interface Props {
  emoji: string
  tamanho?: number
  cor?: string
}

export default function EmojiAnimado({ emoji, tamanho = 48 }: Props) {
  const px = tamanho
  return (
    <span
      role="img"
      aria-label={emoji}
      style={{
        fontSize: px * 0.75,
        lineHeight: 1,
        display: 'inline-block',
        animation: 'emojiPulse 2.4s ease-in-out infinite',
        userSelect: 'none',
      }}
    >
      {emoji}
      <style>{`
        @keyframes emojiPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </span>
  )
}
