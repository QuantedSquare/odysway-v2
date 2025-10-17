<template>
  <v-container
    class="pt-4 py-md-0 my-0"
    fluid
  >
    <!-- <ContentRenderer
      v-if="data"
      :value="data"
    /> -->
    <BlogHeroSection
      v-if="blogSanity"
      :title="blogSanity.title"
      :description="blogSanity.description"
      :image="blogSanity.displayedImg"
      :background-color="'soft-blush'"
      introduction-color="grey"
      title-color="primary"
      avatar-size="60"
    >
      <template #title>
        {{ blogSanity.title }}
      </template>
      <template #introduction>
        {{ blogSanity.description }}
      </template>
    </BlogHeroSection>
    <SectionContainer
      v-if="blogSanity"
    >
      <template #content>
        <EnrichedText
          :value="blogSanity.body"
        />
      </template>
    </SectionContainer>
  </v-container>
</template>

<script setup>
import { watchEffect } from 'vue'
import { getImageUrl } from '~/utils/getImageUrl'
import { useSanityQuery } from '#imports'

const route = useRoute()
const { gtag } = useGtag()

const slug = computed(() => route.params.blogSlug)

const blogQuery = `
  *[_type == "blog" && slug.current == $slug][0]{
    ...,
    author->{
      _id,
      name,
      image,
      position,
    },
    body[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          url,
          metadata
        }
      }
    }
  }
`

const { data: blogSanity } = await useSanityQuery(blogQuery, {
  slug: slug.value,
}, {
  key: 'blog-' + slug.value,
  watch: [slug],
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})


const dataToPage = reactive({
  title: blogSanity.value?.title,
  displayedImg: blogSanity.value?.displayedImg,
  author: blogSanity.value?.author?.name,
  authorPhoto: blogSanity.value?.author?.image,
  authorRole: blogSanity.value?.author?.position,
  published: blogSanity.value?.published,
  publishedAt: blogSanity.value?.publishedAt,
  tags: blogSanity.value?.tags,
  categories: blogSanity.value?.legacyCategories,
  blogType: blogSanity.value?.blogType,
  badgeColor: blogSanity.value?.badgeColor,
  readingTime: blogSanity.value?.readingTime,
})


onMounted(() => {
  trackPixel('trackCustom', 'BlogView', { titre: blogSanity.value.title })
  gtag('event', 'page_view', {
    eventCategory: 'Blog',
    eventAction: 'View',
    eventLabel: blogSanity.value.title })
})

watchEffect(() => {
  if (!blogSanity.value) return
  // SEO Meta Tags
  useSeoMeta({
    title: blogSanity.value.seoTitle || blogSanity.value.title,
    description: blogSanity.value.seoDescription || blogSanity.value.description,
    ogTitle: blogSanity.value.seoTitle || blogSanity.value.title,
    ogDescription: blogSanity.value.seoDescription || blogSanity.value.description,
    ogImage: blogSanity.value.displayedImg ? getImageUrl(blogSanity.value.displayedImg.asset._ref, `${blogSanity.value.slug.current}.jpg`) : undefined,
    ogType: 'article',
    ogUrl: `https://odysway.com${route.path}`,
    twitterTitle: blogSanity.value.seoTitle || blogSanity.value.title,
    twitterDescription: blogSanity.value.seoDescription || blogSanity.value.description,
    twitterImage: blogSanity.value.displayedImg ? getImageUrl(blogSanity.value.displayedImg.asset._ref, `${blogSanity.value.slug.current}.jpg`) : undefined,
    twitterCard: 'summary_large_image',
    canonical: `https://odysway.com${route.path}`,
  })

  // Structured blogSanity (BlogPosting)
  const blogPosting = {
    '@context': 'http://schema.org',
    '@type': 'BlogPosting',
    'headline': blogSanity.value.seoTitle || blogSanity.value.title,
    'publisher': {
      '@type': 'TravelAgency',
      'url': 'https://odysway.com/',
      'name': 'Odysway',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://odysway.com/logos/logo_noir.png',
      },
    },
    'author': blogSanity.value.author || undefined,
    'image': blogSanity.value.displayedImg ? getImageUrl(blogSanity.value.displayedImg.asset._ref, `${blogSanity.value.slug.current}.jpg`) : undefined,
    'datePublished': blogSanity.value.publishedAt,
    'dateModified': blogSanity.value.publishedAt,
    'articleBody': blogSanity.value.seoDescription || blogSanity.value.description,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://odysway.com${route.path}`,
    },
    'keywords': Array.isArray(blogSanity.value.tags) ? blogSanity.value.tags.join(', ') : blogSanity.value?.tags?.split(', '),
  }
  console.log('blogPosting', blogPosting)

  // BreadcrumbList structured blogSanity
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
        'name': blogSanity.value.seoTitle || blogSanity.value.title,
        'item': `https://odysway.com${route.path}`,
      },
    ],
  }

  useHead({
    htmlAttrs: {
      lang: 'fr',
    },
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

provide('page', dataToPage)
</script>
