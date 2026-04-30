<template>
  <ContentLayout
    type="destinations"
    :selected-destination="destinationSanity"
    :display-divider="true"
    :displayed-data="displayedData"
  >
    <template #content>
      <div>
        <DisplayVoyagesRow
          :is-search="true"
          :voyages="destinationSanity.voyages"
        />
      </div>
      <BlogTeaserCard
        v-if="destinationSanity.blog"
        class="mt-12"
        :title="destinationSanity.blog.title"
        :description="destinationSanity.blog.description"
        :slug="destinationSanity.blog.slug.current"
        :displayed-img="destinationSanity.blog.displayedImg"
        :published-at="destinationSanity.blog.publishedAt"
        :reading-time="readingTime"
        :category="blogType"
        :author="destinationSanity.blog.author?.name"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
import _ from 'lodash'

const { trackViewItemList } = useGtmTracking()
const { formatVoyagesForGtm } = useGtmVoyageFormatter()

const route = useRoute()
const slug = computed(() => route.params.destinationSlug)
const isRegionDestination = computed(() => {
  const regionsList = ['europe', 'afrique', 'asie', 'amerique-du-sud', 'amerique-du-nord', 'amerique-centrale', 'moyen-orient', 'france']
  return regionsList.includes(slug.value)
})
// #TODO OPTI LE SELECT DES PROPS NECESSAIRES
const destinationFromRegionQuery = `
  *[_type == "region" && slug.current == $slug][0]{
    _id,
    nom,
    slug,
    meta_description,
    image,
    interjection,
    showOnHome,
    "destinations": *[_type == "destination" && references(^._id)]{
      _id,
      title,
      slug,
      image,
      description,
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

const destinationQuery = `
  *[_type == "destination" && slug.current == $slug][0]{
    _id,
    title,
    badgeTitle,
    slug,
    metaDescription,
    image,
    interjection,
    showOnHome,
    "voyages": *[_type == "voyage" && references(^._id) && (
        !('custom' in availabilityTypes) ||
        (count(availabilityTypes) > 1)
      )]{
      _id,
      title,
      "slug": slug.current,
      image,
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
const sanity = useSanity()
const { data: destinationSanity } = await useAsyncData(
  () => `destination-${slug.value}`,
  async () => {
    if (!isRegionDestination.value) {
      return sanity.fetch(destinationQuery, {
        slug: slug.value,
      })
    }
    else {
      const data = await sanity.fetch(destinationFromRegionQuery, {
        slug: slug.value,
      })
      const voyageFlatMap = _.flatMap(data.destinations.map(destination => destination.voyages))
      return {
        interjection: data.interjection,
        meta_description: data.meta_description,
        slug: data.slug,
        blog: data.blog,
        title: data.nom,
        image: data?.image || voyageFlatMap[0]?.image,
        voyages: voyageFlatMap,
      }
    }
  },
)

// Fetch all destinations for carousel and format for ContentLayout
const destinationsListQuery = `
  *[_type == "destination"]{
    _id,
    title,
    nom,
    slug,
    image,
    metaDescription,
    description
  }
`
const { data: destinationsList } = await useAsyncData('destinations-on-content-layout', () =>
  sanity.fetch(destinationsListQuery),
)

const displayedData = computed(() => ({
  items: destinationsList.value?.map(destination => ({
    id: destination._id,
    title: destination.title || destination.nom,
    slug: destination.slug?.current,
    image: destination.image,
    type: 'destinations',
    discoveryTitle: destination.metaDescription || destination.meta_description || destination.description || '',
  })).filter(destination => destination.image?.asset?._ref),
  selectedItem: destinationSanity.value,
  pageTitle: 'Toutes nos destinations',
  showOnBottom: false,
}))

// Calculate reading time and blogType from blog data
const readingTime = computed(() => {
  if (!destinationSanity.value?.blog) return null
  const calculated = destinationSanity.value.blog.estimatedReadingTime || 0
  return Math.max(1, calculated).toString()
})

const blogType = computed(() => {
  const categories = destinationSanity.value?.blog?.categories || []
  return categories[0]?.title || null
})

// GTM: Track view_item_list when voyages are displayed
watch(() => destinationSanity.value?.voyages, (voyages) => {
  if (voyages && voyages.length > 0) {
    const formattedVoyages = formatVoyagesForGtm(voyages)
    const listName = `Destination - ${destinationSanity.value?.title || destinationSanity.value?.nom || 'Unknown'}`

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
if (destinationSanity.value) {
  useSeo({
    seoData: destinationSanity.value.seo || {},
    content: destinationSanity.value,
    pageType: 'article',
    slug: destinationSanity.value.slug?.current,
    breadcrumbs: [
      { name: 'Accueil', url: 'https://odysway.com' },
      { name: 'Destinations', url: 'https://odysway.com/destinations' },
      {
        name: destinationSanity.value.title,
        url: `https://odysway.com/destinations/${destinationSanity.value.slug.current}`,
      },
    ],
  })
}
</script>
