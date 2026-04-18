import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

// Fallback in-memory para dev/local sem Upstash
const memMap = new Map<string, { count: number; resetAt: number }>()

const hasUpstash = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

const redis = hasUpstash ? Redis.fromEnv() : null

const limiters = new Map<string, Ratelimit>()

function getLimiter(limit: number, windowMs: number): Ratelimit | null {
 if (!redis) return null
 const key = `${limit}:${windowMs}`
 let l = limiters.get(key)
 if (!l) {
 l = new Ratelimit({
 redis,
 limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
 prefix: 'rl:eternizar',
 analytics: false,
 })
 limiters.set(key, l)
 }
 return l
}

function getIp(req: NextRequest): string {
 return (
 req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
 req.headers.get('x-real-ip') ||
 'unknown'
 )
}

export async function rateLimitRedis(req: NextRequest, limit = 10, windowMs = 60_000): Promise<boolean> {
 const ip = getIp(req)
 const limiter = getLimiter(limit, windowMs)

 if (limiter) {
 try {
 const { success } = await limiter.limit(`${ip}:${limit}:${windowMs}`)
 return success
 } catch {
 return rateLimitMemFallback(ip, limit, windowMs)
 }
 }
 return rateLimitMemFallback(ip, limit, windowMs)
}

function rateLimitMemFallback(ip: string, limit: number, windowMs: number): boolean {
 const now = Date.now()
 const entry = memMap.get(ip)
 if (!entry || now > entry.resetAt) {
 memMap.set(ip, { count: 1, resetAt: now + windowMs })
 return true
 }
 if (entry.count >= limit) return false
 entry.count++
 if (memMap.size > 1000) {
 for (const [k, v] of memMap) if (now > v.resetAt) memMap.delete(k)
 }
 return true
}
