/**
 * Utility functions for generating structured data (Schema.org) for different page types
 */

import { portableTextToPlain } from './portableTextToPlain'

// Organization + WebSite identity are emitted globally by nuxt-schema-org
// (schemaOrg.identity in nuxt.config -> #identity / #website). Do NOT create
// competing Organization/WebSite nodes here; attach page-specific data (e.g.
// review ratings) to the identity via useSchemaOrg(defineOrganization(...)).

/**
 * Generate BlogPosting structured data
 * @param {Object} blog - Blog post data
 * @param {String} url - Full URL of the blog post
 * @returns {Object} BlogPosting schema
 */
export function createBlogPostingSchema(blog, url, config = null) {
  // Use SEO object fields if available, fallback to legacy fields
  const seo = blog.seo || {}
  const keywords = seo.keywords || []
  const focusKeyword = seo.focusKeyword || ''
  const allKeywords = [focusKeyword, ...keywords].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': seo.metaTitle || blog.title,
    'publisher': {
      '@type': 'TravelAgency',
      'url': 'https://odysway.com/',
      'name': 'Odysway',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://odysway.com/logos/logo_noir.png',
      },
    },
    'author': blog.author
      ? {
          '@type': 'Person',
          'name': blog.author.name || blog.author,
        }
      : undefined,
    'image': blog.displayedImg
      ? getImageUrl(blog.displayedImg.asset?._ref || blog.displayedImg, `${blog.slug?.current || 'blog'}.jpg`, config)
      : undefined,
    'datePublished': blog.publishedAt,
    'dateModified': blog._updatedAt || blog.publishedAt,
    'articleBody': seo.metaDescription || blog.description,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url,
    },
    'keywords': allKeywords.length > 0 ? allKeywords.join(', ') : '',
  }
}

/**
 * Generate TouristTrip structured data for voyage pages
 * @param {Object} voyage - Voyage data
 * @param {String} url - Full URL of the voyage
 * @returns {Object} TouristTrip schema
 */
export function createTouristTripSchema(voyage, url, config = null) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    'name': voyage.title,
    'description': voyage.metaDescription || voyage.description,
    'image': voyage.image
      ? [getImageUrl(voyage.image.asset?._ref || voyage.image, `${voyage.slug?.current || 'voyage'}.jpg`, config)]
      : undefined,
    'touristType': 'Adventure',
    url,
    'provider': {
      '@type': 'Organization',
      'name': 'Odysway',
      'url': 'https://odysway.com',
    },
  }

  // Add offers if pricing is available
  if (voyage.pricing?.startingPrice) {
    schema.offers = {
      '@type': 'Offer',
      'price': voyage.pricing.startingPrice,
      'priceCurrency': 'EUR',
      'availability': 'https://schema.org/InStock',
    }
  }

  // Add itinerary if programme is available
  if (voyage.programmeBlock?.length > 0) {
    schema.itinerary = voyage.programmeBlock.map((day, index) => ({
      '@type': 'TouristAttraction',
      'name': day.title,
      // description may be Portable Text (array of blocks); Schema.org expects
      // a plain string, otherwise Google reports "Invalid object type for field".
      'description': typeof day.description === 'string'
        ? day.description
        : Array.isArray(day.description)
          ? portableTextToPlain(day.description)
          : undefined,
      'image': day.photo
        ? [getImageUrl(day.photo.asset?._ref || day.photo, `${voyage.slug?.current || 'voyage'}-day-${index + 1}.jpg`, config)]
        : undefined,
    }))
  }

  // Add aggregate rating if available
  if (voyage.rating && voyage.comments) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': voyage.rating,
      'reviewCount': voyage.comments,
      'itemReviewed': {
        '@type': 'TouristTrip',
        'name': voyage.title,
        url,
      },
    }
  }

  return schema
}

/**
 * Generate breadcrumb list
 * @param {Array} crumbs - Array of breadcrumb items [{name, url}]
 * @returns {Object} BreadcrumbList schema
 */
export function createBreadcrumbSchema(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': crumb.url,
    })),
  }
}

/**
 * Generate AggregateRating + Review structured data from first-party reviews.
 * Attaches to the global Organization identity (@id "#identity", set by
 * nuxt-schema-org) so Google/LLMs read the rating against the brand entity.
 *
 * @param {Array} reviews - Review items [{author, rating, text, date, voyageTitle}]
 * @param {Object} [opts]
 * @param {Number} [opts.maxNote=5] - Rating scale maximum
 * @param {Number} [opts.maxReviews=20] - Cap on individual Review nodes emitted
 * @param {String} [opts.orgId='https://odysway.com/#identity'] - Organization @id to attach to
 * @returns {Object|null} Organization schema carrying aggregateRating + review, or null
 */
export function createReviewAggregateSchema(reviews, opts = {}) {
  const {
    maxNote = 5,
    maxReviews = 20,
    orgId = 'https://odysway.com/#identity',
  } = opts

  // Only keep ratings within the [1, maxNote] scale — values outside the range
  // (e.g. stray 0 or 6 in the CMS) make Google reject the reviewRating as
  // "out of range" and skew the aggregate.
  const valid = (reviews || []).filter(
    r => typeof r?.rating === 'number'
      && r.rating >= 1
      && r.rating <= maxNote
      && (r?.text || '').trim().length > 0,
  )
  if (valid.length === 0) return null

  const average = valid.reduce((acc, r) => acc + r.rating, 0) / valid.length

  const reviewNodes = valid
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, maxReviews)
    .map(r => ({
      '@type': 'Review',
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': r.rating,
        'worstRating': 1,
        'bestRating': maxNote,
      },
      'author': {
        '@type': 'Person',
        'name': (r.author || 'Voyageur Odysway').trim(),
      },
      ...(r.date ? { datePublished: new Date(r.date).toISOString().split('T')[0] } : {}),
      'reviewBody': r.text.trim(),
    }))

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': orgId,
    'name': 'ODYSWAY',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': Math.round(average * 10) / 10,
      'worstRating': 1,
      'bestRating': maxNote,
      'ratingCount': valid.length,
      'reviewCount': valid.length,
    },
    'review': reviewNodes,
  }
}

/**
 * Generate FAQPage structured data
 * @param {Array} faqs - Array of FAQ items [{question, answer}]
 * @param {String} url - Canonical URL of the page (for @id)
 * @returns {Object} FAQPage schema
 */
export function createFAQPageSchema(faqs, url = 'https://odysway.com/faq') {
  if (!faqs || faqs.length === 0) return null

  // Ensure url is clean (no trailing slash) for the @id
  const cleanUrl = url.replace(/\/$/, '')

  const mainEntity = faqs
    .map((faq) => {
      // Handle both plain text answers and Portable Text answers
      const answerText = typeof faq.answer === 'string'
        ? faq.answer
        : Array.isArray(faq.answer)
          ? portableTextToPlain(faq.answer)
          : ''

      // Skip if question or answer is effectively empty
      if (!faq.question?.trim() || !answerText.trim()) return null

      return {
        '@type': 'Question',
        'name': faq.question.trim(),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': answerText.trim(),
        },
      }
    })
    .filter(Boolean)
  if (mainEntity.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${cleanUrl}/#faq`,
    'mainEntity': mainEntity,
    'isPartOf': {
      '@id': 'https://odysway.com/#website',
    },
  }
}
