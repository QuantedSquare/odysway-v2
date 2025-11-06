/**
 * Composable for handling SEO across all page types
 *
 * @param {Object} options - SEO configuration options
 * @param {Object} options.seoData - SEO data from Sanity (can use different field naming conventions)
 * @param {Object} options.content - Main content for fallback values
 * @param {String} options.pageType - Type of page: 'website', 'article', 'voyage', 'destination', 'experience', 'category'
 * @param {String} options.slug - Page slug for image naming and URLs
 * @param {String} options.baseUrl - Base URL for canonical links (defaults to current route path)
 * @param {Object} options.structuredData - Custom structured data to include
 * @param {Array} options.breadcrumbs - Breadcrumb items for BreadcrumbList schema
 * @param {Object} options.customMeta - Additional custom meta tags
 */
export function useSeo(options = {}) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const {
    seoData = {},
    content = {},
    pageType = 'website',
    slug = null,
    baseUrl = null,
    structuredData = null,
    breadcrumbs = null,
    customMeta = {},
  } = options

  /**
   * Generate a readable title from a slug
   * @param {String} slug - Page slug (e.g., "immersion-japon")
   * @returns {String} - Formatted title (e.g., "Immersion Japon")
   */
  const generateTitleFromSlug = (slug) => {
    if (!slug) return 'Odysway'

    // Remove common suffixes
    const cleanSlug = slug
      .replace(/\.html?$/i, '')
      .replace(/^\/|\/$/g, '')

    // Split by hyphens/underscores/slashes, capitalize each word
    const words = cleanSlug
      .split(/[-_/]/)
      .map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join(' ')

    return words
  }

  /**
   * Generate a default description from a slug
   * @param {String} slug - Page slug
   * @param {String} pageType - Type of page
   * @returns {String} - Default description
   */
  const generateDescriptionFromSlug = (slug, pageType) => {
    if (!slug) return 'Découvrez Odysway, spécialiste des voyages en petits groupes et des expériences authentiques à travers le monde.'

    const cleanSlug = slug
      .replace(/\.html?$/i, '')
      .replace(/^\/|\/$/g, '')
      .split(/[-_/]/)
      .join(' ')

    // Generate contextual description based on page type
    const templates = {
      article: `Découvrez notre article sur ${cleanSlug}. Guides, conseils et informations pour préparer votre voyage avec Odysway.`,
      website: `Découvrez ${cleanSlug} avec Odysway. Voyages en petits groupes et expériences authentiques.`,
    }

    return templates[pageType] || templates.website
  }

  // Normalize SEO field names (handle different naming conventions)
  const normalizeSeoData = (seo, contentFallback, pageSlug, type) => {
    // For blog-referenced pages (destinations, experiences, thematiques)
    const blogSeo = contentFallback?.blog || {}
    // Generate slug-based defaults
    const defaultTitle = generateTitleFromSlug(pageSlug)
    const defaultDescription = generateDescriptionFromSlug(pageSlug, type)
    return {
      metaTitle:
        seo?.metaTitle // New standard
        || seo?.seoTitle // Blog posts
        || blogSeo?.seoTitle // Blog-referenced content
        || contentFallback?.title // Fallback
        || defaultTitle, // ← Slug-based default
      metaDescription:
        seo?.metaDescription // New standard
        || seo?.seoDescription // Blog posts
        || seo?.ogDescription // Voyage pages
        || blogSeo?.seoDescription // Blog-referenced content
        || contentFallback?.metaDescription
        || contentFallback?.description
        || defaultDescription, // ← Slug-based default
      ogTitle:
        seo?.ogTitle
        || seo?.seoTitle
        || blogSeo?.seoTitle
        || contentFallback?.title
        || defaultTitle, // ← Slug-based default
      ogDescription:
        seo?.ogDescription
        || seo?.seoDescription
        || blogSeo?.seoDescription
        || contentFallback?.metaDescription
        || contentFallback?.description
        || defaultDescription, // ← Slug-based default
      ogImage:
        seo?.ogImage // New standard with asset object
        || seo?.ogImage?.src // Voyage pages
        || blogSeo?.displayedImg // Blog-referenced content
        || contentFallback?.image // General fallback
        || contentFallback?.displayedImg // Blog posts
        || null,
      ogImageAlt:
        seo?.ogImage?.alt
        || blogSeo?.displayedImg?.alt
        || contentFallback?.title
        || 'Odysway',
      canonicalUrl:
        seo?.canonicalUrl
        || blogSeo?.canonicalUrl
        || null,
      keywords:
        seo?.keywords
        || blogSeo?.tags
        || contentFallback?.tags
        || [],
      focusKeyword:
        seo?.focusKeyword
        || blogSeo?.focusKeyword
        || '',
      robotsIndex: seo?.robotsIndex !== false, // Default true
      robotsFollow: seo?.robotsFollow !== false, // Default true
      twitterCard:
        seo?.twitterCard
        || 'summary_large_image',
    }
  }

  const normalized = normalizeSeoData(seoData, content, slug, pageType)
  // Generate canonical URL
  const canonicalUrl = computed(() => {
    if (normalized.canonicalUrl) return normalized.canonicalUrl
    if (baseUrl) return `https://odysway.com${baseUrl}`
    return `https://odysway.com${route.path}`
  })

  // Generate robots meta tag
  const robotsMeta = computed(() => {
    const index = normalized.robotsIndex ? 'index' : 'noindex'
    const follow = normalized.robotsFollow ? 'follow' : 'nofollow'
    return `${index}, ${follow}`
  })

  // Generate OG Image URL with proper formatting
  const ogImageUrl = computed(() => {
    const DEFAULT_IMG = 'https://odysway.com/logos/logo_noir.png'

    // No image object at all
    if (!normalized.ogImage) return DEFAULT_IMG

    const og = normalized.ogImage
    // If og is a string (url or path)
    if (typeof og === 'string') {
      const str = og.trim()
      if (!str) return DEFAULT_IMG
      if (str.toLowerCase().startsWith('http')) return str
      return str
    }

    // Prefer direct URLs first (Sanity asset.url, generic url, or src)
    const directUrl = og?.asset?.url || og?.url || og?.src || ''
    if (typeof directUrl === 'string') {
      const urlStr = directUrl.trim()
      if (urlStr) {
        if (urlStr.toLowerCase().startsWith('http')) return urlStr
        return urlStr
      }
    }
    const vanityName = slug ? `${slug}.jpg` : 'odysway.jpg'

    const mainImg = content?.image || content?.image?.asset?._ref || content?.image?.src || content?.image || ''
    // Otherwise, try Sanity image reference
    const imageRef = og?.asset?._ref || ''

    if (!imageRef) {
      if (!mainImg) return DEFAULT_IMG
      return getImageUrl(mainImg, vanityName)
    }

    // Generate vanity name for SEO

    // Use getImageUrl utility for Sanity refs
    return getImageUrl(imageRef, vanityName)
  })

  // Set SEO meta tags
  useSeoMeta({
    title: normalized.metaTitle,
    description: normalized.metaDescription,
    ogTitle: normalized.ogTitle,
    ogDescription: normalized.ogDescription,
    ogImage: ogImageUrl.value,
    ogImageAlt: normalized.ogImageAlt,
    ogType: pageType === 'article' ? 'article' : 'website',
    ogUrl: canonicalUrl.value,
    ogSiteName: 'Odysway',
    twitterTitle: normalized.ogTitle,
    twitterDescription: normalized.ogDescription,
    twitterImage: ogImageUrl.value,
    twitterImageAlt: normalized.ogImageAlt,
    twitterCard: normalized.twitterCard,
    twitterSite: '@odysway',
    canonical: canonicalUrl.value,
    robots: robotsMeta.value,
    ...customMeta,
  })

  // Build head configuration
  const headConfig = {
    title: normalized.metaTitle,
    htmlAttrs: {
      lang: 'fr',
    },
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'canonical',
        href: canonicalUrl.value,
      },
    ],
    meta: [],
    script: [],
  }

  // Add keywords meta tag if available
  if (normalized.keywords?.length > 0) {
    const keywordsString = Array.isArray(normalized.keywords)
      ? normalized.keywords.join(', ')
      : normalized.keywords
    headConfig.meta.push({
      name: 'keywords',
      content: keywordsString,
    })
  }

  // Add focus keyword meta tag if available
  if (normalized.focusKeyword) {
    headConfig.meta.push({
      name: 'focus-keyword',
      content: normalized.focusKeyword,
    })
  }

  // Add structured data if provided
  if (structuredData) {
    // Handle both single object and array of objects
    const schemas = Array.isArray(structuredData) ? structuredData : [structuredData]
    schemas.forEach((schema) => {
      if (schema) {
        headConfig.script.push({
          type: 'application/ld+json',
          children: JSON.stringify(schema),
        })
      }
    })
  }

  // Add breadcrumbs structured data if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': crumb.name,
        'item': crumb.url,
      })),
    }
    headConfig.script.push({
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema),
    })
  }

  useHead(headConfig)

  // Debug logging (client-side only)
  if (import.meta.client && config.public.environment === 'development') {
    console.group('🔍 SEO Debug - ' + (normalized.metaTitle || 'No Title'))

    console.log('📄 Page Info:', {
      type: pageType,
      slug,
      path: route.path,
    })

    console.log('📝 Meta Tags:', {
      title: normalized.metaTitle,
      description: normalized.metaDescription?.substring(0, 100),
      canonical: canonicalUrl.value,
      robots: robotsMeta.value,
    })

    console.log('🖼️ Open Graph:', {
      ogTitle: normalized.ogTitle,
      ogDescription: normalized.ogDescription?.substring(0, 100),
      ogImage: ogImageUrl.value,
      ogImageAlt: normalized.ogImageAlt,
      ogType: pageType === 'article' ? 'article' : 'website',
    })

    console.log('🐦 Twitter Card:', {
      twitterTitle: normalized.ogTitle,
      twitterCard: normalized.twitterCard,
      twitterImage: ogImageUrl.value,
    })

    if (normalized.keywords?.length > 0) {
      console.log('🔑 Keywords:', normalized.keywords)
    }

    if (normalized.focusKeyword) {
      console.log('🎯 Focus Keyword:', normalized.focusKeyword)
    }

    if (structuredData) {
      const schemas = Array.isArray(structuredData) ? structuredData : [structuredData]
      console.log('📊 Structured Data (' + schemas.filter(s => s).length + ' schemas):',
        schemas.filter(s => s).map(s => s['@type']),
      )
      // Log full structured data for inspection
      schemas.forEach((schema, index) => {
        if (schema) {
          console.log(`  ${index + 1}. ${schema['@type']}:`, schema)
        }
      })
    }

    if (breadcrumbs?.length > 0) {
      console.log('🍞 Breadcrumbs:', breadcrumbs.map(b => b.name).join(' → '))
    }

    console.groupEnd()
  }

  return {
    normalized,
    canonicalUrl,
    robotsMeta,
    ogImageUrl,
  }
}
