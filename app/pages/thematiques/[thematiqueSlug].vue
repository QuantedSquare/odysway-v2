<template>
  <ContentLayout
    :selected-category="categorySanity"
    :page-content="pageContent"
    :display-divider="true"
    :displayed-data="displayedData"
    type="thematiques"
  >
    <template #content>
      <div>
        <DisplayVoyagesRow
          v-if="categorySanity"
          :is-search="true"
          :selected-category="categorySanity"
          :voyages="categorySanity.voyages"
          :page-content="pageContent"
        />
      </div>
      <BlogHeroSection
        v-if="categorySanity?.blog"
        class="mt-12"
        :title="categorySanity.blog.title"
        :description="categorySanity.blog.description"
        :image="categorySanity.blog.displayedImg"
        :background-color="'soft-blush'"
        introduction-color="grey"
        title-color="primary"
        avatar-size="60"
        :blog-type="blogType"
        :badge-color="badgeColor"
        :reading-time="readingTime"
        :published-at="categorySanity.blog.publishedAt"
        :author="categorySanity.blog.author?.name"
        :author-photo="categorySanity.blog.author?.image"
        :author-role="categorySanity.blog.author?.position"
      >
        <template #title>
          {{ categorySanity.blog.title }}
        </template>
        <template #introduction>
          {{ categorySanity.blog.description }}
        </template>
      </BlogHeroSection>
      <SectionContainer
        v-if="categorySanity?.blog"
        :title="categorySanity.blog.title"
        :subtitle="categorySanity.blog.excerpt"
      >
        <template #content>
          <EnrichedText
            :value="categorySanity.blog.body"
          />
        </template>
      </SectionContainer>
    </template>
  </ContentLayout>
</template>

<script setup>
const { trackViewItemList } = useGtmTracking()
const { formatVoyagesForGtm } = useGtmVoyageFormatter()

const route = useRoute()
const slug = computed(() => {
  return route.params.thematiqueSlug
})

// Fetch page thematiques content
const pageContentQuery = `
  *[_type == "page_thematiques"][0]{
    ...
  }
`
const sanity = useSanity()
const { data: pageContent } = await useAsyncData('page-content', async () => {
  try {
    const result = await sanity.fetch(pageContentQuery)
    return result || {}
  }
  catch {
    return {}
  }
})

// Fetch the category with its linked blog post
const categoryQuery = `
  *[_type == "category" && slug.current == $slug][0]{
      _id,
    title,
    slug,
    image,
    "voyages": *[_type == "voyage" && references(^._id) && (
        !('custom' in availabilityTypes)
      )]{
        _id,
      title,
      slug,
      image,
      duration,
      nights,
      rating,
      comments,
      availabilityTypes,
      "startingPrice": pricing.startingPrice,
      pricing {
        startingPrice
      }
    },
    seo,
    blog->{
      _id,
      title,
      slug,
      description,
      displayedImg,
      publishedAt,
      body,
      categories[]->{
        _id,
        title
      },
      author->{
        _id,
        name,
        image,
        position
      },
      body[]{
        ...,
        _type == "image" => {
          ...,
          asset->{
            _id,
            url,
            "metadata": {
              "dimensions": metadata.dimensions,
              "lqip": metadata.lqip
            }
          }
        }
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
      "numberOfCharacters": length(pt::text(body)),
      "estimatedWordCount": round(length(pt::text(body)) / 5),
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
    },
  }
`

const { data: categorySanity } = await useAsyncData(
  () => `category-sanity-${slug.value}`,
  async () => {
    try {
      const result = await sanity.fetch(categoryQuery, { slug: slug.value })
      return result
    }
    catch {
      return null
    }
  },
)

// Fetch all categories for carousel and format for ContentLayout
const categoriesListQuery = `
  *[_type == "category"]{
    _id,
    title,
    slug,
    image,
    discoveryTitle,
    description
  }
`
const { data: categoriesList } = await useAsyncData('categories-on-content-layout', async () => {
  try {
    const result = await sanity.fetch(categoriesListQuery)
    return result || []
  }
  catch {
    return []
  }
})

const displayedData = computed(() => ({
  items: categoriesList.value?.map(category => ({
    id: category._id,
    title: category.title,
    slug: category.slug?.current,
    image: category.image,
    type: 'thematiques',
    discoveryTitle: category.discoveryTitle || category.description || '',
  })).filter(category => category.image?.asset?._ref),
  selectedItem: categorySanity.value,
  pageTitle: pageContent.value?.index?.pageTitle || 'Toutes nos thématiques',
  showOnBottom: false,
}))

// Calculate reading time and blogType from blog data
const readingTime = computed(() => {
  if (!categorySanity.value?.blog) return null
  const calculated = categorySanity.value.blog.estimatedReadingTime || 0
  return Math.max(1, calculated).toString()
})

const blogType = computed(() => {
  const categories = categorySanity.value?.blog?.categories || []
  return categories[0]?.title || null
})

const badgeColor = computed(() => blogType.value ? 'secondary' : null)

// GTM: Track view_item_list when voyages are displayed
watch(() => categorySanity.value?.voyages, (voyages) => {
  if (voyages && voyages.length > 0) {
    const formattedVoyages = formatVoyagesForGtm(voyages)
    const listName = `Thematique - ${categorySanity.value?.title || 'Unknown'}`
    trackViewItemList(formattedVoyages, listName)
  }
}, { immediate: true })

// Use SEO composable - automatically uses blog's SEO fields
if (categorySanity.value) {
  useSeo({
    seoData: categorySanity.value.seo || categorySanity.value.blog?.seo || {}, // If {} blog SEO will be detected from content.blog or fallback or generated default
    content: categorySanity.value,
    pageType: 'article',
    slug: categorySanity.value.slug?.current,
    structuredData: categorySanity.value.blog
      ? createBlogPostingSchema(
          categorySanity.value.blog,
          `https://odysway.com/thematiques/${categorySanity.value.slug.current}`,
        )
      : null,
    breadcrumbs: [
      { name: 'Accueil', url: 'https://odysway.com' },
      { name: 'Thématiques', url: 'https://odysway.com/thematiques' },
      {
        name: categorySanity.value.title,
        url: `https://odysway.com/thematiques/${categorySanity.value.slug.current}`,
      },
    ],
  })
}
</script>
