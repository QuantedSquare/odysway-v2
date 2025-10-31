import { createClient } from '@sanity/client'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true,
  })

  // Get all content for sitemap
  const [blogPosts, voyages, destinations, experiences, categories] = await Promise.all([
    sanityClient.fetch(`*[_type == "blog"]{
      "slug": slug.current,
      _updatedAt
    }`),
    sanityClient.fetch(`*[_type == "voyage"]{
      "slug": slug.current,
      _updatedAt
    }`),
    sanityClient.fetch(`*[_type == "destination"]{
      "slug": slug.current,
      _updatedAt
    }`),
    sanityClient.fetch(`*[_type == "experience"]{
      "slug": slug.current,
      _updatedAt
    }`),
    sanityClient.fetch(`*[_type == "category"]{
      "slug": slug.current,
      _updatedAt
    }`),
  ])
  const sitemapUrls = [
    // Static pages
    { url: '/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
    { url: '/search', lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.9 },
    { url: '/contact', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.8 },
    { url: '/sur-mesure', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.8 },
    { url: '/nous-recrutons', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.7 },
    { url: '/cheques-vacances', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.7 },
    { url: '/offre-cadeau', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.7 },

    // Blog posts
    ...blogPosts.map((post: any) => ({
      url: `/${post.slug}`,
      lastmod: post._updatedAt,
      changefreq: 'monthly',
      priority: 0.7,
    })),

    // Voyages
    ...voyages.map((voyage: any) => ({
      url: `/voyages/${voyage.slug}`,
      lastmod: voyage._updatedAt,
      changefreq: 'weekly',
      priority: 0.9,
    })),

    // Destinations
    ...destinations.map((dest: any) => ({
      url: `/destinations/${dest.slug}`,
      lastmod: dest._updatedAt,
      changefreq: 'monthly',
      priority: 0.8,
    })),

    // Experiences
    ...experiences.map((exp: any) => ({
      url: `/experiences/${exp.slug}`,
      lastmod: exp._updatedAt,
      changefreq: 'monthly',
      priority: 0.8,
    })),

    // Categories (Thematiques)
    ...categories.map((cat: any) => ({
      url: `/thematiques/${cat.slug}`,
      lastmod: cat._updatedAt,
      changefreq: 'monthly',
      priority: 0.8,
    })),
  ]

  // console.log('sitemapUrls', sitemapUrls)
  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(item => `  <url>
    <loc>https://odysway.com${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return sitemap
})
