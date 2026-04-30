import { createClient } from '@sanity/client'

const SITE_URL = 'https://odysway.com'
const CACHE_TTL = 60 * 60 // 1 hour

interface SanityVoyage {
  title: string
  slug: string
  description?: string | null
  duration?: number | null
  startingPrice?: number | null
  destinations?: Array<{ title: string }> | null
}

interface SanityBlog {
  title: string
  slug: string
  description?: string | null
  categoryTitle?: string | null
}

interface SanityItem {
  title: string
  slug: string
  description?: string | null
}

function getSanityClient() {
  const config = useRuntimeConfig()
  return createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: false,
  })
}

function fmt(text: string | null | undefined, fallback = ''): string {
  return text?.trim() || fallback
}

function buildHeader(): string[] {
  return [
    '# Odysway — Agence de voyages immersifs',
    '',
    '> Odysway est une agence de voyages française spécialisée dans les expériences immersives et responsables. Rencontres authentiques, immersions culturelles et aventures hors des sentiers battus à travers le monde.',
    '',
  ]
}

function buildAbout(): string[] {
  return [
    '## À propos d\'Odysway',
    '',
    'Odysway est une agence de voyages fondée sur la conviction que voyager, c\'est avant tout rencontrer. Chaque voyage est conçu pour permettre aux voyageurs de s\'immerger dans la vie locale, de partager des moments authentiques avec des communautés, et de revenir transformés.',
    '',
    `- [Notre vision du voyage](${SITE_URL}/vision-voyage-odysway) : Philosophie et concept Odysway`,
    `- [Avis voyageurs](${SITE_URL}/avis-voyageurs) : Témoignages et retours d'expérience`,
    '',
  ]
}

function buildKeyPages(): string[] {
  return [
    '## Pages clés',
    '',
    `- [Accueil](${SITE_URL}/) : Découvrez Odysway, l'agence de voyages immersifs`,
    `- [Tous les voyages](${SITE_URL}/voyages) : Catalogue complet des voyages immersifs`,
    `- [Notre vision du voyage](${SITE_URL}/vision-voyage-odysway) : Philosophie Odysway`,
    `- [Voyages sur mesure](${SITE_URL}/sur-mesure) : Voyages personnalisés sur mesure`,
    `- [FAQ](${SITE_URL}/faq) : Questions fréquentes sur nos voyages et services`,
    `- [Avis voyageurs](${SITE_URL}/avis-voyageurs) : Témoignages clients`,
    `- [Offre cadeau](${SITE_URL}/offre-cadeau) : Offrir un voyage immersif`,
    `- [Contact](${SITE_URL}/contact) : Nous contacter`,
    `- [Blog voyage](${SITE_URL}/blog) : Articles et guides de voyage`,
    '',
  ]
}

function buildDestinations(items: SanityItem[]): string[] {
  if (!items.length) return []
  const lines: string[] = ['## Destinations', '']
  for (const item of items) {
    const desc = fmt(item.description)
    const line = desc
      ? `- [${item.title}](${SITE_URL}/destinations/${item.slug}) : ${desc}`
      : `- [${item.title}](${SITE_URL}/destinations/${item.slug})`
    lines.push(line)
  }
  lines.push('')
  return lines
}

function buildThematiques(items: SanityItem[]): string[] {
  if (!items.length) return []
  const lines: string[] = ['## Thématiques de voyage', '']
  for (const item of items) {
    const desc = fmt(item.description)
    const line = desc
      ? `- [${item.title}](${SITE_URL}/thematiques/${item.slug}) : ${desc}`
      : `- [${item.title}](${SITE_URL}/thematiques/${item.slug})`
    lines.push(line)
  }
  lines.push('')
  return lines
}

function buildExperiences(items: SanityItem[]): string[] {
  if (!items.length) return []
  const lines: string[] = ['## Types d\'expériences', '']
  for (const item of items) {
    const desc = fmt(item.description)
    const line = desc
      ? `- [${item.title}](${SITE_URL}/experiences/${item.slug}) : ${desc}`
      : `- [${item.title}](${SITE_URL}/experiences/${item.slug})`
    lines.push(line)
  }
  lines.push('')
  return lines
}

function buildVoyages(voyages: SanityVoyage[]): string[] {
  if (!voyages.length) return []

  // Group by first destination title (fallback to "Autre")
  const grouped = new Map<string, SanityVoyage[]>()
  for (const voyage of voyages) {
    const dest = voyage.destinations?.[0]?.title?.trim() || 'Autre'
    const list = grouped.get(dest) ?? []
    list.push(voyage)
    grouped.set(dest, list)
  }

  const lines: string[] = ['## Voyages immersifs par destination', '']

  const sortedDests = Array.from(grouped.keys()).sort((a, b) =>
    a.localeCompare(b, 'fr', { sensitivity: 'base' })
  )

  for (const dest of sortedDests) {
    lines.push(`### ${dest}`)
    lines.push('')
    for (const v of grouped.get(dest)!) {
      const parts: string[] = []
      if (v.duration) parts.push(`${v.duration}j`)
      if (v.startingPrice) parts.push(`à partir de ${v.startingPrice}€`)
      const meta = parts.length ? ` (${parts.join(', ')})` : ''
      const desc = fmt(v.description)
      const suffix = desc ? ` : ${desc}` : ''
      lines.push(`- [${v.title}](${SITE_URL}/voyages/${v.slug})${meta}${suffix}`)
    }
    lines.push('')
  }

  return lines
}

function buildBlog(posts: SanityBlog[]): string[] {
  if (!posts.length) return []

  const grouped = new Map<string, SanityBlog[]>()
  for (const post of posts) {
    const cat = fmt(post.categoryTitle, 'Non classé')
    const list = grouped.get(cat) ?? []
    list.push(post)
    grouped.set(cat, list)
  }

  const lines: string[] = ['## Blog — Articles de voyage', '']

  const sortedCats = Array.from(grouped.keys()).sort((a, b) =>
    a.localeCompare(b, 'fr', { sensitivity: 'base' })
  )

  for (const cat of sortedCats) {
    lines.push(`### ${cat}`)
    lines.push('')
    for (const post of grouped.get(cat)!) {
      const desc = fmt(post.description)
      const suffix = desc ? ` : ${desc}` : ''
      lines.push(`- [${post.title}](${SITE_URL}/blog/${post.slug})${suffix}`)
    }
    lines.push('')
  }

  return lines
}

function buildDiscovery(): string[] {
  return [
    '## Découverte',
    '',
    `- Sitemap XML : ${SITE_URL}/sitemap.xml`,
    `- Robots : ${SITE_URL}/robots.txt`,
    '',
  ]
}

const getCachedContent = defineCachedFunction(
  async (): Promise<string> => {
    const client = getSanityClient()

    const [voyages, blogs, destinations, thematiques, experiences] = await Promise.all([
      client.fetch<SanityVoyage[]>(
        `*[_type == "voyage" && defined(slug.current) && (!('custom' in availabilityTypes) || count(availabilityTypes) > 1)] | order(title asc) {
          title,
          "slug": slug.current,
          description,
          duration,
          "startingPrice": pricing.startingPrice,
          "destinations": destinations[]->{title}
        }`
      ),
      client.fetch<SanityBlog[]>(
        `*[_type == "blog" && defined(slug.current)] | order(publishedAt desc) [0...80] {
          title,
          "slug": slug.current,
          description,
          "categoryTitle": categories[0]->title
        }`
      ),
      client.fetch<SanityItem[]>(
        `*[_type == "destination" && defined(slug.current)] | order(title asc) {
          title,
          "slug": slug.current,
          "description": coalesce(metaDescription, seo.metaDescription)
        }`
      ),
      client.fetch<SanityItem[]>(
        `*[_type == "category" && defined(slug.current)] | order(title asc) {
          title,
          "slug": slug.current,
          "description": seo.metaDescription
        }`
      ),
      client.fetch<SanityItem[]>(
        `*[_type == "experience" && defined(slug.current)] | order(title asc) {
          title,
          "slug": slug.current,
          "description": coalesce(description, seo.metaDescription)
        }`
      ),
    ])

    const sections: string[][] = [
      buildHeader(),
      buildAbout(),
      buildKeyPages(),
      buildDestinations(destinations ?? []),
      buildThematiques(thematiques ?? []),
      buildExperiences(experiences ?? []),
      buildVoyages(voyages ?? []),
      buildBlog(blogs ?? []),
      buildDiscovery(),
    ]

    return sections.flat().join('\n')
  },
  {
    maxAge: CACHE_TTL,
    name: 'llms-txt',
    getKey: () => 'llms-txt',
  }
)

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': `public, max-age=0, s-maxage=${CACHE_TTL}`,
  })
  return getCachedContent()
})
