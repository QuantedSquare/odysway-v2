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
          :blog-type="blogType"
          :badge-color="badgeColor"
          :reading-time="readingTime"
          :published-at="selectedExperience.blog.publishedAt"
          :author="selectedExperience.blog.author?.name"
          :author-photo="selectedExperience.blog.author?.image"
          :author-role="selectedExperience.blog.author?.position"
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
    "voyages": *[_type == "voyage" && references(^._id) && (
        !('custom' in availabilityTypes) ||
        (count(availabilityTypes) > 1)
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

// Calculate reading time and blogType from blog data
const readingTime = computed(() => {
  if (!selectedExperience.value?.blog) return null
  const calculated = selectedExperience.value.blog.estimatedReadingTime || 0
  return Math.max(1, calculated).toString()
})

const blogType = computed(() => {
  const categories = selectedExperience.value?.blog?.categories || []
  return categories[0]?.title || null
})

const badgeColor = computed(() => blogType.value ? 'secondary' : null)

// Use SEO composable - automatically uses blog's SEO fields
if (selectedExperience.value) {
  useSeo({
    seoData: selectedExperience.value.seo || {}, // If {} blog SEO will be detected from content.blog or fallback or generated default
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
