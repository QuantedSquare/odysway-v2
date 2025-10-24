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

  // Normalize SEO field names (handle different naming conventions)
  const normalizeSeoData = (seo, contentFallback) => {
    // For blog-referenced pages (destinations, experiences, thematiques)
    const blogSeo = contentFallback?.blog || {}

    return {
      metaTitle:
        seo?.metaTitle // New standard
        || seo?.seoTitle // Blog posts
        || blogSeo?.seoTitle // Blog-referenced content
        || contentFallback?.title // Fallback
        || '',
      metaDescription:
        seo?.metaDescription // New standard
        || seo?.seoDescription // Blog posts
        || seo?.ogDescription // Voyage pages
        || blogSeo?.seoDescription // Blog-referenced content
        || contentFallback?.metaDescription
        || contentFallback?.description
        || '',
      ogTitle:
        seo?.ogTitle
        || seo?.seoTitle
        || blogSeo?.seoTitle
        || contentFallback?.title
        || '',
      ogDescription:
        seo?.ogDescription
        || seo?.seoDescription
        || blogSeo?.seoDescription
        || contentFallback?.metaDescription
        || contentFallback?.description
        || '',
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

  const normalized = normalizeSeoData(seoData, content)

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
    if (!normalized.ogImage) return 'https://odysway.com/logos/logo_noir.png'

    // Handle different image formats
    const imageRef = normalized.ogImage?.asset?._ref || normalized.ogImage?.src || normalized.ogImage

    if (!imageRef) return 'https://odysway.com/logos/logo_noir.png'

    // If it's already a full URL, return it
    if (typeof imageRef === 'string' && imageRef.startsWith('http')) {
      return imageRef
    }

    // Generate vanity name for SEO
    const vanityName = slug ? `${slug}.jpg` : 'odysway.jpg'

    // Use getImageUrl utility
    return getImageUrl(imageRef, vanityName)
  })

  // Set SEO meta tags
  console.log('normalized', normalized)
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

  return {
    normalized,
    canonicalUrl,
    robotsMeta,
    ogImageUrl,
  }
}
