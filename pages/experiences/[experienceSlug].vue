<template>
  <ContentLayout
    :selected-experience="selectedExperience"
    :page-content="pageContent"
    :display-divider="true"
    :displayed-data="displayedData"
    type="experiences"
  >
    <template #content>
      <div>
        <DisplayVoyagesRow
          :is-search="true"
          :selected-experience="selectedExperience"
          :voyages="selectedExperience.voyages"
          :page-content="pageContent"
        />
        <BlogHeroSection
          v-if="selectedExperience?.blog"
          class="mt-12"
          :title="selectedExperience.blog.title"
          :description="selectedExperience.blog.description"
          :image="selectedExperience.blog.displayedImg"
          :background-color="'soft-blush'"
          introduction-color="grey"
          title-color="primary"
          avatar-size="60"
        >
          <template #title>
            {{ selectedExperience.blog.title }}
          </template>
          <template #introduction>
            {{ selectedExperience.blog.description }}
          </template>
        </BlogHeroSection>
        <SectionContainer
          v-if="selectedExperience?.blog"
          :title="selectedExperience.blog.title"
          :subtitle="selectedExperience.blog.excerpt"
        >
          <template #content>
            <EnrichedText
              :value="selectedExperience.blog.body"
            />
          </template>
        </SectionContainer>
      </div>
    </template>
  </ContentLayout>
</template>

<script setup>
const route = useRoute()
const slug = computed(() => route.params.experienceSlug)

const pageContentQuery = groq`*[_type == "page_experiences"][0]{
  ...
}`
const sanity = useSanity()
const { data: pageContent } = await useAsyncData('page-content', () =>
  sanity.fetch(pageContentQuery),
)

const experienceQuery = `
  *[_type == "experience" && slug.current == $slug][0]{
    _id,
    title,
    badgeTitle,
    slug,
    description,
    image,
    showOnHome,
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

const { data: selectedExperience } = await useAsyncData(
  () => `selected-experience-${slug.value}`,
  () => sanity.fetch(experienceQuery, { slug: slug.value }),
)

// Fetch all experiences for carousel and format for ContentLayout
const experiencesListQuery = `
  *[_type == "experience"]{
    _id,
    title,
    slug,
    image,
    discoveryTitle,
    description
  }
`
const { data: experiencesList } = await useAsyncData('experiences-on-content-layout', () =>
  sanity.fetch(experiencesListQuery),
)

const displayedData = computed(() => ({
  items: experiencesList.value?.map(experience => ({
    id: experience._id,
    title: experience.title,
    slug: experience.slug?.current,
    image: experience.image,
    type: 'experiences',
    discoveryTitle: experience.discoveryTitle || experience.description || '',
  })).filter(experience => experience.image?.asset?._ref),
  selectedItem: selectedExperience.value,
  pageTitle: pageContent.value?.index?.pageTitle || 'Toutes nos expériences',
  showOnBottom: false,
}))

const dataToBlog = reactive({
  title: selectedExperience.value?.blog?.title,
  displayedImg: selectedExperience.value?.blog?.displayedImg,
  author: selectedExperience.value?.blog?.author?.name,
  authorPhoto: selectedExperience.value?.blog?.author?.image,
  authorRole: selectedExperience.value?.blog?.author?.position,
  published: selectedExperience.value?.blog?.published,
  publishedAt: selectedExperience.value?.blog?.publishedAt,
  tags: selectedExperience.value?.blog?.tags,
  categories: selectedExperience.value?.blog?.legacyCategories,
  blogType: selectedExperience.value?.blog?.blogType,
  badgeColor: selectedExperience.value?.blog?.badgeColor,
  readingTime: selectedExperience.value?.blog?.readingTime,
})

provide('page', dataToBlog)

// Use SEO composable - automatically uses blog's SEO fields
if (selectedExperience.value) {
  useSeo({
    seoData: {}, // Blog SEO will be detected from content.blog
    content: selectedExperience.value,
    pageType: 'article',
    slug: selectedExperience.value.slug?.current,
    structuredData: selectedExperience.value.blog
      ? createBlogPostingSchema(
          selectedExperience.value.blog,
          `https://odysway.com/experiences/${selectedExperience.value.slug.current}`,
        )
      : null,
    breadcrumbs: [
      { name: 'Accueil', url: 'https://odysway.com' },
      { name: 'Expériences', url: 'https://odysway.com/experiences' },
      {
        name: selectedExperience.value.title,
        url: `https://odysway.com/experiences/${selectedExperience.value.slug.current}`,
      },
    ],
  })
}
</script>
