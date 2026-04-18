import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
 const checks: Record<string, boolean> = {
 supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
 supabase_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
 supabase_service: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
 senha_salt: !!process.env.SENHA_SALT,
 upstash_url: !!process.env.UPSTASH_REDIS_REST_URL,
 upstash_token: !!process.env.UPSTASH_REDIS_REST_TOKEN,
 }
 const ok = Object.values(checks).every(Boolean)
 return NextResponse.json(
 { ok, ts: Date.now(), checks },
 { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
 )
}
