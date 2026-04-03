import { NextRequest } from 'next/server'

// ─── Rate Limiting ───────────────────────────────────────────────
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
  return true

  // Limpar entradas antigas periodicamente (memory leak prevention)
}

// Limpeza periódica (a cada 5 minutos remove entradas expiradas)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, val] of requestMap) {
      if (now > val.resetAt) requestMap.delete(key)
    }
  }, 5 * 60 * 1000)
}

// ─── Sanitização XSS ────────────────────────────────────────────
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
    .slice(0, 5000) // Limite absoluto
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

// ─── Validação de tipos ──────────────────────────────────────────
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

export function validarNome(nome: string): boolean {
  if (typeof nome !== 'string') return false
  const limpo = nome.trim()
  return limpo.length >= 1 && limpo.length <= 50
}

// ─── Validação de JSON seguro ────────────────────────────────────
export function parseJsonSeguro<T>(str: string, fallback: T): T {
  if (typeof str !== 'string' || !str) return fallback
  try {
    const parsed = JSON.parse(str)
    // Prevenir prototype pollution
    if (typeof parsed === 'object' && parsed !== null) {
      if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
        return fallback
      }
    }
    return parsed
  } catch {
    return fallback
  }
}

// ─── Validação de tamanho de arquivo ─────────────────────────────
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

// ─── Slug ────────────────────────────────────────────────────────
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

// ─── Validação do request body inteiro ───────────────────────────
export function validarCriacaoPagina(fd: FormData): { ok: boolean; erros: string[] } {
  const erros: string[] = []
  
  const tipo = fd.get('tipo') as string
  if (!tipo || !validarTipo(tipo)) erros.push('Tipo inválido')
  
  const titulo = fd.get('titulo') as string
  if (!titulo || titulo.trim().length < 1) erros.push('Título obrigatório')
  if (titulo && titulo.length > 100) erros.push('Título muito longo')
  
  const mensagem = fd.get('mensagem') as string
  if (!mensagem || mensagem.trim().length < 1) erros.push('Mensagem obrigatória')
  if (mensagem && mensagem.length > 1000) erros.push('Mensagem muito longa')
  
  const email = fd.get('emailCliente') as string
  if (!email || !validarEmail(email)) erros.push('E-mail inválido')
  
  const corTema = fd.get('corTema') as string
  if (corTema && !validarCor(corTema)) erros.push('Cor inválida')
  
  return { ok: erros.length === 0, erros }
}
