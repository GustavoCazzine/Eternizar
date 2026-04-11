import { NextRequest } from 'next/server'

// ─── Rate Limiting ───────────────────────────────────────────────
// ATENÇÃO: este rate-limiter é em memória e NÃO funciona corretamente
// em ambiente serverless (cada cold start reseta o Map, instâncias
// são isoladas). É uma defesa best-effort até migrarmos pra Upstash
// Redis ou tabela no Supabase. Mantido porque qualquer defesa > zero.
const requestMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(req: NextRequest, limit = 10, windowMs = 60_000): boolean {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const now = Date.now()
  const entry = requestMap.get(ip)

  if (!entry || now > entry.resetAt) {
    requestMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false
  entry.count++

  // Limpeza inline quando map cresce demais
  if (requestMap.size > 1000) {
    for (const [k, v] of requestMap) {
      if (now > v.resetAt) requestMap.delete(k)
    }
  }
  return true
}

// ─── Sanitização XSS ────────────────────────────────────────────
// Escapa caracteres que poderiam ser interpretados como HTML.
// IMPORTANTE: o React já escapa automaticamente ao renderizar texto,
// então esse sanitize é defesa extra para contexto de logs, e-mails,
// concatenação de strings — NUNCA confie só nele.
export function sanitize(str: string): string {
  if (typeof str !== 'string') return ''
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#x60;')
    .trim()
    .slice(0, 5000)
}

// Sanitiza mas preserva emojis e caracteres unicode (pra mensagens)
export function sanitizeTexto(str: string, maxLen = 600): string {
  if (typeof str !== 'string') return ''
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\/g, '')
    .trim()
    .slice(0, maxLen)
}

// ─── Validações ──────────────────────────────────────────────────
export function validarTipo(tipo: string): boolean {
  return ['casal', 'formatura', 'homenagem', 'lembrete'].includes(tipo)
}

export function validarCor(cor: string): boolean {
  return ['pink', 'violet', 'amber', 'blue', 'emerald', 'rose'].includes(cor)
}

export function validarEmail(email: string): boolean {
  if (typeof email !== 'string') return false
  if (email.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validarData(data: string): boolean {
  if (!data) return true // Opcional
  const d = new Date(data)
  if (isNaN(d.getTime())) return false
  const minDate = new Date('1950-01-01')
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 6) // Permite até 6 anos no futuro (formaturas)
  return d >= minDate && d <= maxDate
}

// ─── Parser JSON seguro ──────────────────────────────────────────
// Protege contra prototype pollution (__proto__, constructor, prototype).
export function parseJsonSeguro<T>(str: string, fallback: T): T {
  if (typeof str !== 'string' || !str) return fallback
  try {
    const parsed = JSON.parse(str)
    if (typeof parsed === 'object' && parsed !== null) {
      if (Object.prototype.hasOwnProperty.call(parsed, '__proto__') ||
          Object.prototype.hasOwnProperty.call(parsed, 'constructor') ||
          Object.prototype.hasOwnProperty.call(parsed, 'prototype')) {
        return fallback
      }
    }
    return parsed
  } catch {
    return fallback
  }
}

// ─── Validação de upload de arquivo ──────────────────────────────
export function validarArquivo(file: File, maxSizeMB = 10): { ok: boolean; erro?: string } {
  if (!(file instanceof File)) return { ok: false, erro: 'Arquivo inválido' }
  if (file.size === 0) return { ok: false, erro: 'Arquivo vazio' }
  if (file.size > maxSizeMB * 1024 * 1024) return { ok: false, erro: `Arquivo maior que ${maxSizeMB}MB` }

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const permitidos = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  if (!permitidos.includes(ext)) return { ok: false, erro: 'Formato não permitido' }

  const mimePermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!mimePermitidos.includes(file.type)) return { ok: false, erro: 'Tipo MIME não permitido' }

  return { ok: true }
}

// ─── Geração de slug ─────────────────────────────────────────────
// Transforma o título em kebab-case ASCII + 5 chars aleatórios.
// ~60M combinações por título; colisão é raríssima mas possível
// (o caller deve tratar com retry em unique constraint violation).
export function gerarSlug(titulo: string): string {
  if (typeof titulo !== 'string') return `pagina-${Date.now()}`
  const base = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40)
  const random = Math.random().toString(36).slice(2, 7)
  return `${base || 'pagina'}-${random}`
}
