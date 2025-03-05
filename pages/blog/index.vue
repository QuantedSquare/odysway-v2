<template>
  <div class="mt-16">
    <v-container>
      <v-row
        justify="center"
        align="center"
        no-gutters
      >
        <v-col
          class="text-dark font-weight-black text-h5 text-md-h4 my-4"
        >
          Blog
        </v-col>
      </v-row>
    </v-container>
    <v-container>
      <v-row>
        <v-skeleton-loader
          v-if="loading"
          type="card"
        />
        <v-col
          v-for="page, index in parsedPages"
          v-else
          :key="index"
          cols="12"
          sm="6"
        >
          <v-card
            variant="text"
            height="100%"
            :href="page.slug"
          >
            <v-img
              :src="img(page.imgSrc, { format: 'webp', quality: 70, width: 640 })"
              height="100%"
              cover
            >
              <div class="position-absolute bottom-0 text-white">
                <v-card-subtitle>{{ page.publicationDate }}</v-card-subtitle>
                <v-card-title class="no-white-space">
                  {{ page.title }}
                </v-card-title>
              </div>
            </v-img>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useImage } from '#imports'

const img = useImage()

const route = useRoute()
const { data: pages, status } = await useAsyncData(route.path, () => {
  return queryCollection('blog').all()
})

const loading = computed(() => {
  if (status.value === 'success') {
    return false
  }
  return true
})

const parsedPages = computed(() => {
  const parsedPages = pages.value.map((page) => {
    return {
      title: page.title, // find the way to get a title from page hero-section
      testTitle: page.body.value[0][3],
      publicationDate: page.body.value[0][2][2][2][2],
      imgSrc: page.body.value[0][1]['image-src'],
      slug: page.path,
    }
  })
  return parsedPages.slice(1)
})
// console.log(parsedPages.value[0].testTitle)

// const sortPages = computed(() => {
//   return [...parsedPages.value].sort((a, b) => {
//     return new Date(b.publicationDate) - new Date(a.publicationDate)
//   })
// })

// console.log(sortPages.value)
</script>
