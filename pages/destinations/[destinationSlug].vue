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

const destinationQuery = `
  *[_type == "destination" && slug.current == $slug][0]{
    ...,
    "voyages": *[_type == "voyage" && references(^._id)]{
      ...,
      image{
        asset->{
          url
        }
      }
    },
    blog->{
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
  }
`
const { data: destinationSanity } = await useAsyncData('destinationSanity', async () => {
  const { data } = await useSanityQuery(destinationQuery, {
    slug: slug.value,
  })
  return data.value
}, {
  watch: [slug],
  server: true,
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
  transform: (data) => {
    const transformedData = { ...data, voyages: data.voyages?.map(voyage => ({ ...voyage, image: { src: voyage.image?.asset?.url, alt: voyage.image?.alt } })) }
    return transformedData
  },
})
console.log('DATA DESTINATION  SANITY', destinationSanity.value)

const dataToBlog = reactive({
  title: destinationSanity.value?.blog?.title,
  displayedImg: destinationSanity.value?.blog?.displayedImg?.asset?.url,
  author: destinationSanity.value?.blog?.author?.name,
  authorPhoto: destinationSanity.value?.blog?.author?.image?.asset?.url,
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
useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
