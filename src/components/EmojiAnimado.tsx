'use client'

// EmojiAnimado: renderiza o emoji nativamente com animação CSS leve.
// A keyframe 'emojiPulse' fica em globals.css (evita injeção de <style>
// a cada render quando o componente é usado múltiplas vezes).

interface Props {
  emoji: string
  tamanho?: number
}

export default function EmojiAnimado({ emoji, tamanho = 48 }: Props) {
  return (
    <span
      role="img"
      aria-label={emoji}
      style={{
        fontSize: tamanho * 0.75,
        lineHeight: 1,
        display: 'inline-block',
        animation: 'emojiPulse 2.4s ease-in-out infinite',
        userSelect: 'none',
      }}
    >
      {emoji}
    </span>
  )
}
