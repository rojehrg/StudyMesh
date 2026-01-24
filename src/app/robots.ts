import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/analytics/',
          '/team/',
          '/onboarding/',
          '/admin/',
        ],
      },
    ],
    sitemap: 'https://attunly.com/sitemap.xml',
  }
}
