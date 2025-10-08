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

const route = useRoute()
const { gtag } = useGtag()
const { data } = await useAsyncData(route.path, () => {
  return queryCollection('blog').path('/blog' + route.path).where('published', '=', true).first()
})

const slug = computed(() => route.params.blogSlug)

const blogQuery = `
  *[_type == "blog" && slug.current == $slug][0]{
    ...,
    displayedImg{
      asset->{
        url
      }
    },
    author->{
      _id,
      name,
      image{
        asset->{
          url
        }
      },
      position
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
const {
  data: blogSanity,
  errorSanity,
  pending,
} = await useAsyncData(
  `blog-${slug.value}`,
  async () => {
    const { data } = await useSanityQuery(blogQuery, {
      slug: slug.value,
    })
    console.log(data.value)
    return data.value
  },
  {
    watch: [slug],
    server: true,
    getCachedData: (key) => {
      return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
    },
  },
)
console.log(blogSanity.value)

const dataToPage = reactive({
  title: blogSanity.value?.title,
  displayedImg: blogSanity.value?.displayedImg?.asset?.url,
  author: blogSanity.value?.author?.name,
  authorPhoto: blogSanity.value?.author?.image?.asset?.url,
  authorRole: blogSanity.value?.author?.position,
  published: blogSanity.value?.published,
  publishedAt: blogSanity.value?.publishedAt,
  tags: blogSanity.value?.tags,
  categories: blogSanity.value?.legacyCategories,
  blogType: blogSanity.value?.blogType,
  badgeColor: blogSanity.value?.badgeColor,
  readingTime: blogSanity.value?.readingTime,
})

console.log('dataToPage', dataToPage)

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
    'keywords': Array.isArray(data.value.tags) ? data.value.tags.join(', ') : data.value.tags.split(', '),
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
