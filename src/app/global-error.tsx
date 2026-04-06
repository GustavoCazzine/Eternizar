'use client'

// Último recurso: capturado quando o próprio RootLayout explode.
// Precisa incluir <html> e <body> porque substitui o layout inteiro.
// Mantém texto inline e zero dependências externas pra garantir que renderize.

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError:root]', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <html lang="pt-BR">
      <body
        style={{
          background: '#08080c',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          margin: 0,
        }}
      >
        <div style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
              color: '#ff2d78',
            }}
          >
            ♥
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            Eternizar está fora do ar
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#71717a',
              marginBottom: '24px',
              lineHeight: 1.6,
            }}
          >
            Tivemos um problema crítico. Tente recarregar a página em alguns segundos.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: '11px',
                color: '#3f3f46',
                fontFamily: 'monospace',
                marginBottom: '24px',
              }}
            >
              ref: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, #ff2d78, #ff2d78aa)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
