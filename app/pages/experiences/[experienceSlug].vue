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
        <BlogTeaserCard
          v-if="selectedExperience?.blog"
          class="mt-12"
          :title="selectedExperience.blog.title"
          :description="selectedExperience.blog.description"
          :slug="selectedExperience.blog.slug.current"
          :displayed-img="selectedExperience.blog.displayedImg"
          :published-at="selectedExperience.blog.publishedAt"
          :reading-time="readingTime"
          :category="blogType"
          :author="selectedExperience.blog.author?.name"
        />
      </div>
    </template>
  </ContentLayout>
</template>

<script setup>
const { trackViewItemList } = useGtmTracking()
const { formatVoyagesForGtm } = useGtmVoyageFormatter()

const route = useRoute()
const slug = computed(() => route.params.experienceSlug)

const pageContentQuery = groq`*[_type == "page_experiences"][0]{
  ...
}`
const { data: pageContent } = await useSanityQuery(pageContentQuery)

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
      "slug": slug.current,
      image,
      imageCard,
      duration,
      nights,
      rating,
      comments,
      availabilityTypes,
      "startingPrice": pricing.startingPrice,
      pricing {
        startingPrice
      },
      destinations[]->{
        _id,
        title
      },
      experienceType->{
        _id,
        title
      },
      categories[]->{
        _id,
        title
      },
      monthlyAvailability
    },
    seo,
    blog->{
      _id,
      title,
      slug,
      description,
      displayedImg,
      publishedAt,
      categories[]->{
        _id,
        title
      },
      author->{
        _id,
        name,
        image
      },
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
    },
  }
`

const { data: selectedExperience } = await useSanityQuery(
  experienceQuery,
  computed(() => ({ slug: slug.value })),
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
const { data: experiencesList } = await useSanityQuery(experiencesListQuery)

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

// GTM: Track view_item_list when voyages are displayed
watch(() => selectedExperience.value?.voyages, (voyages) => {
  if (voyages && voyages.length > 0) {
    const formattedVoyages = formatVoyagesForGtm(voyages)
    const listName = `Experience - ${selectedExperience.value?.title || 'Unknown'}`

    if (formattedVoyages && formattedVoyages.length > 0) {
      trackViewItemList({
        currency: 'EUR',
        items: formattedVoyages,
        itemListName: listName,
      })
    }
  }
}, { immediate: true })

// Use SEO composable - automatically uses blog's SEO fields
if (selectedExperience.value) {
  useSeo({
    seoData: selectedExperience.value.seo || {},
    content: selectedExperience.value,
    pageType: 'article',
    slug: selectedExperience.value.slug?.current,
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
