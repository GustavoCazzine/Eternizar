import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eternizar.io'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/criar', '/entrar', '/demo'],
        disallow: ['/api/', '/painel', '/editar/', '/sucesso', '/p/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
