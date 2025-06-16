<template>
  <v-container
    class="py-0 my-0"
    fluid
  >
    <ContentRenderer
      v-if="data"
      :value="data"
    />
  </v-container>
</template>

<script setup>
import { watchEffect } from 'vue'

const route = useRoute()
const { gtag } = useGtag()
const { data } = await useAsyncData(route.path, () => {
  return queryCollection('blog').path('/blog' + route.path).first()
})

onMounted(() => {
  trackPixel('trackCustom', 'BlogView', { titre: data.value.title })
  gtag('event', 'page_view', {
    eventCategory: 'Blog',
    eventAction: 'View',
    eventLabel: data.value.title })
})

watchEffect(() => {
  if (!data.value) return
  // SEO Meta Tags
  useSeoMeta({
    title: data.value.seo?.title || data.value.title,
    description: data.value.seo?.description || data.value.description,
    ogTitle: data.value.seo?.title || data.value.title,
    ogDescription: data.value.seo?.description || data.value.description,
    ogImage: data.value.displayedImg ? `https://odysway.com${data.value.displayedImg}` : undefined,
    ogType: 'article',
    ogUrl: `https://odysway.com${route.path}`,
    twitterTitle: data.value.seo?.title || data.value.title,
    twitterDescription: data.value.seo?.description || data.value.description,
    twitterImage: data.value.displayedImg ? `https://odysway.com${data.value.displayedImg}` : undefined,
    twitterCard: 'summary_large_image',
    canonical: `https://odysway.com${route.path}`,
  })

  // Structured Data (BlogPosting)
  const blogPosting = {
    '@context': 'http://schema.org',
    '@type': 'BlogPosting',
    'headline': data.value.seo?.title || data.value.title,
    'publisher': {
      '@type': 'TravelAgency',
      'url': 'https://odysway.com/',
      'name': 'Odysway',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://odysway.com/logos/logo_noir.png',
      },
    },
    'author': data.value.author || undefined,
    'image': data.value.displayedImg ? `https://odysway.com${data.value.displayedImg}` : undefined,
    'datePublished': data.value.publishedAt,
    'dateModified': data.value.publishedAt,
    'articleBody': data.value.seo?.description || data.value.description,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://odysway.com${route.path}`,
    },
  }

  // BreadcrumbList structured data
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Blog',
        'item': 'https://odysway.com/blog',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': data.value.seo?.title || data.value.title,
        'item': `https://odysway.com${route.path}`,
      },
    ],
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(blogPosting),
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify(breadcrumbs),
      },
    ],
  })
})

provide('page', data)
</script>
