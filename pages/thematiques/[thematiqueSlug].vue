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
    "voyages": *[_type == "voyage" && references(^._id)]{
        _id,
      title,
      slug,
      image,
      duration,
      nights,
      rating,
      comments,
      groupeAvailable,
      "startingPrice": pricing.startingPrice,
      pricing {
        startingPrice
      }
    },
    blog->{
      _id,
      title,
      slug,
      description,
      displayedImg,
      publishedAt,
      readingTime,
      legacyCategories,
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
      seo
    },
  }
`

const { data: categorySanity } = await useAsyncData(
  () => `category-sanity-${slug.value}`,
  async () => {
    try {
      const result = await sanity.fetch(categoryQuery, { slug: slug.value })
      return result || {}
    }
    catch {
      return {}
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

const dataToBlog = reactive({
  title: categorySanity.value?.blog?.title,
  displayedImg: categorySanity.value?.blog?.displayedImg,
  author: categorySanity.value?.blog?.author?.name,
  authorPhoto: categorySanity.value?.blog?.author?.image,
  authorRole: categorySanity.value?.blog?.author?.position,
  published: categorySanity.value?.blog?.published,
  publishedAt: categorySanity.value?.blog?.publishedAt,
  tags: categorySanity.value?.blog?.tags,
  categories: categorySanity.value?.blog?.legacyCategories,
  blogType: categorySanity.value?.blog?.blogType,
  badgeColor: categorySanity.value?.blog?.badgeColor,
  readingTime: categorySanity.value?.blog?.readingTime,
})

provide('page', dataToBlog)

// Use SEO composable - automatically uses blog's SEO fields
if (categorySanity.value) {
  // console.log('categorySanity', categorySanity.value)
  useSeo({
    seoData: {}, // Blog SEO will be detected from content.blog
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
