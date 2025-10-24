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

// #TODO OPTI LE SELECT DES PROPS NECESSAIRES
const destinationQuery = `
  *[_type == "destination" && slug.current == $slug][0]{
    ...,
    "voyages": *[_type == "voyage" && references(^._id)]{
      ...,
    },
    blog->{
      ...,
      author->{
        ...
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
const sanity = useSanity()
const { data: destinationSanity } = await useAsyncData('destination', () =>
  sanity.fetch(destinationQuery, {
    slug: slug.value,
  }),
)

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
