import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eternizar.io'
 const now = new Date()
 return [
 { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
 { url: `${baseUrl}/criar`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
 { url: `${baseUrl}/entrar`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
 
 ]
}
