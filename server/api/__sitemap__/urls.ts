import { createClient } from '@sanity/client'
import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true,
  })

  const [blogPosts, voyages, destinations, experiences, categories] = await Promise.all([
    sanityClient.fetch(`*[_type == "blog"]{ "slug": slug.current, _updatedAt }`),
    sanityClient.fetch(`*[_type == "voyage"]{ "slug": slug.current, _updatedAt }`),
    sanityClient.fetch(`*[_type == "destination"]{ "slug": slug.current, _updatedAt }`),
    sanityClient.fetch(`*[_type == "experience"]{ "slug": slug.current, _updatedAt }`),
    sanityClient.fetch(`*[_type == "category"]{ "slug": slug.current, _updatedAt }`),
  ])

  const urls: SitemapUrlInput[] = [
    // Static key pages
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/voyages', changefreq: 'daily', priority: 0.9 },
    { loc: '/contact', changefreq: 'monthly', priority: 0.8 },
    { loc: '/sur-mesure', changefreq: 'monthly', priority: 0.8 },
    { loc: '/nous-recrutons', changefreq: 'monthly', priority: 0.7 },
    { loc: '/cheques-vacances', changefreq: 'monthly', priority: 0.7 },
    { loc: '/offre-cadeau', changefreq: 'monthly', priority: 0.7 },
  ]

  // Blog
  for (const post of blogPosts as any[]) {
    urls.push({ loc: `/${post.slug}`, lastmod: post._updatedAt, changefreq: 'monthly', priority: 0.7 })
  }

  // Voyages
  for (const voyage of voyages as any[]) {
    urls.push({ loc: `/voyages/${voyage.slug}`, lastmod: voyage._updatedAt, changefreq: 'weekly', priority: 0.9 })
  }

  // Destinations
  for (const dest of destinations as any[]) {
    urls.push({ loc: `/destinations/${dest.slug}`, lastmod: dest._updatedAt, changefreq: 'monthly', priority: 0.8 })
  }

  // Experiences
  for (const exp of experiences as any[]) {
    urls.push({ loc: `/experiences/${exp.slug}`, lastmod: exp._updatedAt, changefreq: 'monthly', priority: 0.8 })
  }

  // Categories (Thematiques)
  for (const cat of categories as any[]) {
    urls.push({ loc: `/thematiques/${cat.slug}`, lastmod: cat._updatedAt, changefreq: 'monthly', priority: 0.8 })
  }

  return urls
})
