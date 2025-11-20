<template>
  <v-container
    class="pt-4 py-md-0 my-0"
    fluid
  >
    <BlogHeroSection
      v-if="blogSanity"
      :title="blogSanity.title"
      :description="blogSanity.description"
      :image="blogSanity.displayedImg"
      :background-color="'soft-blush'"
      introduction-color="grey"
      title-color="primary"
      avatar-size="60"
      :blog-type="blogType"
      :badge-color="badgeColor"
      :reading-time="readingTime"
      :published-at="blogSanity.publishedAt"
      :author="blogSanity.author?.name"
      :author-photo="blogSanity.author?.image"
      :author-role="blogSanity.author?.position"
      :author-description="blogSanity.author?.description"
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
      description
    },
    categories[]->{
      _id,
      title
    },
    seo{
      metaTitle,
      metaDescription,
      canonicalUrl,
      focusKeyword,
      keywords,
      robotsIndex,
      robotsFollow,
      ogTitle,
      ogDescription,
      ogImage{
        asset->{
          _id,
          _ref,
          url
        },
        alt
      }
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
    },
    "numberOfCharacters": length(pt::text(body)),
    "estimatedWordCount": round(length(pt::text(body)) / 5),
    "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
  }
`

const sanity = useSanity()
const { data: blogSanity } = await useAsyncData('blog', () =>
  sanity.fetch(blogQuery, {
    slug: slug.value,
  }),
)
console.log('blogSanity', blogSanity.value)
// If no blog post found, throw 404 to prevent catch-all from matching static routes
if (!blogSanity.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
  })
}

// Calculate reading time (minimum 1 minute)
const readingTime = computed(() => {
  const calculated = blogSanity.value?.estimatedReadingTime || 0
  return Math.max(1, calculated).toString()
})

// Get first category for blogType
const blogType = computed(() => {
  const categories = blogSanity.value?.categories || []
  return categories[0]?.title || null
})

// Badge color when category exists
const badgeColor = computed(() => blogType.value ? 'secondary' : null)

onMounted(() => {
  trackPixel('trackCustom', 'BlogView', { titre: blogSanity.value.title })
  gtag('event', 'page_view', {
    eventCategory: 'Blog',
    eventAction: 'View',
    eventLabel: blogSanity.value.title })
})

watchEffect(() => {
  if (!blogSanity.value) return

  // Use the SEO composable with BlogPosting structured data
  useSeo({
    seoData: blogSanity.value.seo || {}, // Use seo object from blogType.ts
    content: blogSanity.value,
    pageType: 'article',
    slug: blogSanity.value.slug?.current,
    structuredData: createBlogPostingSchema(
      blogSanity.value,
      `https://odysway.com${route.path}`,
    ),
    breadcrumbs: [
      { name: 'Blog', url: 'https://odysway.com/blog' },
      { name: blogSanity.value.seo?.metaTitle || blogSanity.value.title, url: `https://odysway.com${route.path}` },
    ],
  })
})
</script>
