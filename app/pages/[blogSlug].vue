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

const sanity = useSanity()
const { data: blogSanity } = await useAsyncData('blog', () =>
  sanity.fetch(blogQuery, {
    slug: slug.value,
  }),
)

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

  // Use the SEO composable with BlogPosting structured data
  useSeo({
    seoData: blogSanity.value, // Uses seoTitle, seoDescription naming
    content: blogSanity.value,
    pageType: 'article',
    slug: blogSanity.value.slug?.current,
    structuredData: createBlogPostingSchema(
      blogSanity.value,
      `https://odysway.com${route.path}`,
    ),
    breadcrumbs: [
      { name: 'Blog', url: 'https://odysway.com/blog' },
      { name: blogSanity.value.seoTitle || blogSanity.value.title, url: `https://odysway.com${route.path}` },
    ],
  })
})

provide('page', dataToPage)
</script>
