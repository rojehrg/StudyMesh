import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://attunly.com'

  // Public pages with their priorities and change frequencies
  const routes = [
    {
      path: '',
      priority: 1.0,
      changeFrequency: 'weekly' as const,
    },
    {
      path: '/beta',
      priority: 0.9,
      changeFrequency: 'weekly' as const,
    },
    {
      path: '/pricing',
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    },
    {
      path: '/privacy',
      priority: 0.5,
      changeFrequency: 'monthly' as const,
    },
    {
      path: '/terms',
      priority: 0.5,
      changeFrequency: 'monthly' as const,
    },
    {
      path: '/security',
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    },
    {
      path: '/support',
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    },
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
