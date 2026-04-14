#!/usr/bin/env node
/* eslint-disable */
// Auditoria de segurança local — roda checks rápidos antes do deploy.
// Uso: node scripts/audit-security.mjs

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const ROOT = process.cwd()
const fails = []
const warns = []
const passes = []

function ok(msg) { passes.push(msg) }
function warn(msg) { warns.push(msg) }
function fail(msg) { fails.push(msg) }

function walk(dir, exts = ['.ts', '.tsx']) {
  const out = []
  for (const item of readdirSync(dir)) {
    if (item === 'node_modules' || item === '.next' || item.startsWith('.')) continue
    const full = join(dir, item)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walk(full, exts))
    else if (exts.some(e => item.endsWith(e))) out.push(full)
  }
  return out
}

// 1. .env não commitado
try {
  const tracked = execSync('git ls-files', { cwd: ROOT }).toString()
  if (/\.env(\.|\b)/.test(tracked) && !tracked.match(/\.env\.example/)) {
    fail('.env file is tracked by git!')
  } else ok('.env files not tracked by git')
} catch { warn('git not available — skipped tracked-env check') }

// 2. SERVICE_ROLE não usado em client components
const files = walk(join(ROOT, 'src'))
let leakSR = false
for (const f of files) {
  const c = readFileSync(f, 'utf8')
  if (c.includes('SERVICE_ROLE') || c.includes('service_role')) {
    if (c.startsWith("'use client'") || c.startsWith('"use client"')) {
      fail(`SERVICE_ROLE referenced in client component: ${f}`)
      leakSR = true
    }
  }
}
if (!leakSR) ok('SERVICE_ROLE_KEY not leaked to any client component')

// 3. Todas rotas /api têm rate limit
const apiDir = join(ROOT, 'src', 'app', 'api')
let semRL = []
for (const f of walk(apiDir)) {
  if (!f.endsWith('route.ts')) continue
  const c = readFileSync(f, 'utf8')
  if (!/rateLimit(Async)?\s*\(/.test(c)) semRL.push(f.replace(ROOT, ''))
}
if (semRL.length) warn(`Routes without rate limit: ${semRL.join(', ')}`)
else ok('All API routes have rate limiting')

// 4. supabaseAdmin nunca importado em client
let adminLeak = []
for (const f of files) {
  const c = readFileSync(f, 'utf8')
  if (c.includes('supabaseAdmin') && (c.startsWith("'use client'") || c.startsWith('"use client"'))) {
    adminLeak.push(f.replace(ROOT, ''))
  }
}
if (adminLeak.length) fail(`supabaseAdmin used in client: ${adminLeak.join(', ')}`)
else ok('supabaseAdmin only used server-side')

// 5. Rotas que mutam (POST/PATCH/DELETE) sem getAuthUser (exceto criar/guestbook POST/webhook/verificar-senha)
const mutWhitelist = ['criar', 'webhook', 'verificar-senha', 'signout', 'gerar', 'status']
let semAuth = []
for (const f of walk(apiDir)) {
  if (!f.endsWith('route.ts')) continue
  if (mutWhitelist.some(w => f.includes(w))) continue
  const c = readFileSync(f, 'utf8')
  const hasMutation = /export async function (POST|PATCH|DELETE|PUT)/.test(c)
  if (hasMutation && !c.includes('getAuthUser')) semAuth.push(f.replace(ROOT, ''))
}
if (semAuth.length) fail(`Mutating routes without auth check: ${semAuth.join(', ')}`)
else ok('All mutating routes verify auth')

// 6. Hardcoded secrets
const secretPatterns = [
  /sk_live_[a-zA-Z0-9]{20,}/,
  /APP_USR-[a-zA-Z0-9-]{30,}/,
  /eyJ[a-zA-Z0-9_-]{30,}\.[a-zA-Z0-9_-]{30,}\.[a-zA-Z0-9_-]{30,}/,
]
let secretLeak = []
for (const f of files) {
  const c = readFileSync(f, 'utf8')
  for (const p of secretPatterns) {
    if (p.test(c)) secretLeak.push(f.replace(ROOT, ''))
  }
}
if (secretLeak.length) fail(`Possible hardcoded secrets in: ${secretLeak.join(', ')}`)
else ok('No hardcoded API keys/tokens detected')

// 7. console.log com dados sensíveis
let consoleLeak = []
for (const f of files) {
  const c = readFileSync(f, 'utf8')
  if (/console\.(log|info|debug)\([^)]*(senha|password|token|secret|service_role)/i.test(c)) {
    consoleLeak.push(f.replace(ROOT, ''))
  }
}
if (consoleLeak.length) fail(`Sensitive data in console.log: ${consoleLeak.join(', ')}`)
else ok('No sensitive data in console.log')

// 8. CSP / security headers presentes
const cfg = readFileSync(join(ROOT, 'next.config.ts'), 'utf8')
const required = ['X-Frame-Options', 'X-Content-Type-Options', 'Strict-Transport-Security', 'Content-Security-Policy', 'Referrer-Policy', 'Permissions-Policy']
const missing = required.filter(h => !cfg.includes(h))
if (missing.length) fail(`Missing security headers: ${missing.join(', ')}`)
else ok('All security headers configured')

// 9. ignoreBuildErrors
if (cfg.includes('ignoreBuildErrors: true')) warn('ignoreBuildErrors is true — TS errors mascarados')
else ok('TS build errors are enforced')

// ─── REPORT ─────────────────────────────────────────────────────
console.log('\n═══ AUDITORIA DE SEGURANÇA — Eternizar ═══\n')
console.log(`✓ ${passes.length} checks passaram`)
console.log(`⚠ ${warns.length} warnings`)
console.log(`✗ ${fails.length} falhas\n`)

if (passes.length) console.log('PASSOU:\n' + passes.map(p => '  ✓ ' + p).join('\n'))
if (warns.length) console.log('\nWARNINGS:\n' + warns.map(w => '  ⚠ ' + w).join('\n'))
if (fails.length) console.log('\nFALHAS:\n' + fails.map(f => '  ✗ ' + f).join('\n'))

console.log('')
process.exit(fails.length ? 1 : 0)
