<template>
  <ContentLayout
    :is-category="true"
    :selected-category="categorySanity"
    :page-content="pageContent"
    :display-divider="true"
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
const slug = computed(() => route.params.thematiqueSlug)

// Fetch page thematiques content
const pageContentQuery = `
  *[_type == "page_thematiques"][0]{
    ...
  }
`
const { data: pageContent } = await useSanityQuery(pageContentQuery, {}, {
  key: 'page-thematiques',
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})

// Fetch the category with its linked blog post
const categoryQuery = `
  *[_type == "category" && slug.current == $slug][0]{
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

const { data: categorySanity } = await useSanityQuery(categoryQuery, {
  slug: slug.value,
}, {
  key: 'category-' + slug.value,
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})

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

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
