/**
 * Utility functions for generating structured data (Schema.org) for different page types
 */

import { portableTextToPlain } from './portableTextToPlain'

/**
 * Generate Organization structured data
 * @param {Object} options - Organization options
 * @returns {Object} Organization schema
 */
export function createOrganizationSchema(options = {}) {
  const {
    name = 'Odysway',
    url = 'https://odysway.com',
    logo = 'https://odysway.com/logos/logo_noir.png',
    description = '',
    sameAs = [
      'https://www.facebook.com/odysway',
      'https://www.instagram.com/odysway',
      'https://www.linkedin.com/company/odysway',
    ],
  } = options

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs,
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'Customer Service',
      'telephone': '+33-1-84-88-37-91',
      'email': 'contact@odysway.com',
      'areaServed': 'FR',
      'availableLanguage': ['French', 'English'],
    },
  }
}

/**
 * Generate WebSite structured data with search action
 * @returns {Object} WebSite schema
 */
export function createWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Odysway',
    'url': 'https://odysway.com',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://odysway.com/voyages?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate BlogPosting structured data
 * @param {Object} blog - Blog post data
 * @param {String} url - Full URL of the blog post
 * @returns {Object} BlogPosting schema
 */
export function createBlogPostingSchema(blog, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': blog.seoTitle || blog.title,
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
      ? getImageUrl(blog.displayedImg.asset?._ref || blog.displayedImg, `${blog.slug?.current || 'blog'}.jpg`)
      : undefined,
    'datePublished': blog.publishedAt,
    'dateModified': blog.publishedAt,
    'articleBody': blog.seoDescription || blog.description,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url,
    },
    'keywords': Array.isArray(blog.tags)
      ? blog.tags.join(', ')
      : blog.tags || '',
  }
}

/**
 * Generate TouristTrip structured data for voyage pages
 * @param {Object} voyage - Voyage data
 * @param {String} url - Full URL of the voyage
 * @returns {Object} TouristTrip schema
 */
export function createTouristTripSchema(voyage, url) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    'name': voyage.title,
    'description': voyage.metaDescription || voyage.description,
    'image': voyage.image
      ? [getImageUrl(voyage.image.asset?._ref || voyage.image, `${voyage.slug?.current || 'voyage'}.jpg`)]
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
      'description': day.description,
      'image': day.photo
        ? [getImageUrl(day.photo.asset?._ref || day.photo, `${voyage.slug?.current || 'voyage'}-day-${index + 1}.jpg`)]
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
 * Generate FAQPage structured data
 * @param {Array} faqs - Array of FAQ items [{question, answer}] or [{question, answer (Portable Text)}]
 * @returns {Object} FAQPage schema
 */
export function createFAQPageSchema(faqs) {
  if (!faqs || faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs
      .filter(faq => faq.question && faq.answer) // Only include complete FAQs
      .map((faq) => {
        // Handle both plain text answers and Portable Text answers
        const answerText = typeof faq.answer === 'string'
          ? faq.answer
          : Array.isArray(faq.answer)
            ? portableTextToPlain(faq.answer)
            : ''

        return {
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': answerText,
          },
        }
      }),
  }
}
