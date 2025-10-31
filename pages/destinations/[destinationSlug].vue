<template>
  <ContentLayout
    :is-destination="true"
    :selected-destination="destinationSanity"
    :display-divider="true"
  >
    <template #content>
      <div>
        <DisplayVoyagesRow
          :is-search="true"
          :voyages="destinationSanity.voyages"
        />
      </div>
      <BlogHeroSection
        v-if="destinationSanity.blog"
        class="mt-12"
        :title="destinationSanity.blog.title"
        :description="destinationSanity.blog.description"
        :image="destinationSanity.blog.displayedImg"
        :background-color="'soft-blush'"
        introduction-color="grey"
        title-color="primary"
        avatar-size="60"
      >
        <template #title>
          {{ destinationSanity.blog.title }}
        </template>
        <template #introduction>
          {{ destinationSanity.blog.description }}
        </template>
      </BlogHeroSection>
      <SectionContainer
        v-if="destinationSanity.blog"
        :title="'categorySanity.blog.title'"
        :subtitle="'categorySanity.blog.excerpt'"
      >
        <template #content>
          <EnrichedText
            :value="destinationSanity.blog.body"
          />
        </template>
      </SectionContainer>
    </template>
  </ContentLayout>
</template>

<script setup>
import _ from 'lodash'

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
    description,
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

const destinationQuery = `
  *[_type == "destination" && slug.current == $slug][0]{
_id,
    title,
    badgeTitle,
    slug,
    description,
    image,
    interjection,
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
const sanity = useSanity()
const { data: destinationSanity } = await useAsyncData('destination', async () => {
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
      image: voyageFlatMap[0]?.image,
      voyages: voyageFlatMap,
    }
  }
})

const dataToBlog = reactive({
  title: destinationSanity.value?.blog?.title,
  displayedImg: destinationSanity.value?.blog?.displayedImg,
  author: destinationSanity.value?.blog?.author?.name,
  authorPhoto: destinationSanity.value?.blog?.author?.image,
  authorRole: destinationSanity.value?.blog?.author?.position,
  published: destinationSanity.value?.blog?.published,
  publishedAt: destinationSanity.value?.blog?.publishedAt,
  tags: destinationSanity.value?.blog?.tags,
  categories: destinationSanity.value?.blog?.legacyCategories,
  blogType: destinationSanity.value?.blog?.blogType,
  badgeColor: destinationSanity.value?.blog?.badgeColor,
  readingTime: destinationSanity.value?.blog?.readingTime,
})

provide('page', dataToBlog)

// Use SEO composable - automatically uses blog's SEO fields
if (destinationSanity.value) {
  useSeo({
    seoData: {}, // Blog SEO will be detected from content.blog
    content: destinationSanity.value,
    pageType: 'article',
    slug: destinationSanity.value.slug?.current,
    structuredData: destinationSanity.value.blog
      ? createBlogPostingSchema(
          destinationSanity.value.blog,
          `https://odysway.com/destinations/${destinationSanity.value.slug.current}`,
        )
      : null,
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
