<template>
  <ContentLayout
    :is-experience="true"
    :selected-experience="selectedExperience"
    :page-content="pageContent"
    :display-divider="true"
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
const { data: pageContent } = await useSanityQuery(pageContentQuery, {}, {
  key: 'page-experiences',
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})

const experienceQuery = `
  *[_type == "experience" && slug.current == $slug][0]{
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
    },
  }
`

const { data: selectedExperience } = await useSanityQuery(experienceQuery, {
  slug: slug.value,
}, {
  key: 'experience-' + slug.value,
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})

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

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
