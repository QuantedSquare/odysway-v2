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
              class="hover-scale"
              height="100%"
              cover
            >
              <div class="position-absolute bottom-0 text-white">
                <v-card-subtitle>{{ dayjs(page.publishedAt).format('DD/MM/YYYY') }}</v-card-subtitle>
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
import dayjs from 'dayjs'
import { useImage } from '#imports'

const img = useImage()

const route = useRoute()
const { data: pages, status } = useAsyncData(route.path, () => {
  return queryCollection('blog').all()
})

const loading = computed(() => {
  return status.value !== 'success'
})

const parsedPages = computed(() => {
  const parsedPages = pages.value?.map((page) => {
    console.log('page in array', page)
    return {
      title: page.title, // find the way to get a title from page hero-section
      publishedAt: page.publishedAt,
      imgSrc: page.displayedImg,
      slug: page.path,
    }
  }).sort((a, b) => {
    return dayjs((b.publishedAt)) - dayjs((a.publishedAt))
  })
  return parsedPages
})
console.log(parsedPages.value)
</script>

<style scoped>
.hover-scale:hover {
  height: 100%;
}
.hover-scale:hover{
  transform: scale(1.02);
  transition: transform 0.2s ease-in-out;
}
.hover-scale{
  transform: scale(1);
  transition: transform 0.2s ease-in-out;
}
</style>
