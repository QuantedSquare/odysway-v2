<template>
  <div>
    <v-container>
      <v-row
        justify="center"
        align="center"
        no-gutters
      >
        <v-col
          class=" font-weight-black text-h2 my-4"
        >
          Blog
        </v-col>
      </v-row>
    </v-container>
    <v-container>
      <v-row v-if="loading">
        <v-col
          v-for="n in 10"
          :key="n"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-skeleton-loader
            type="card"
          />
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col
          v-for="page, index in parsedPages"
          :key="index"
          cols="12"
          sm="6"
          lg="4"
        >
          <BlogCard
            v-bind="page"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'

const route = useRoute()
const { data: pages, status } = useAsyncData(route.path, () => {
  return queryCollection('blog').all()
})

const loading = computed(() => {
  return status.value !== 'success'
})

const parsedPages = computed(() => {
  const parsedPages = pages.value?.map((page) => {
    return {
      title: page.title,
      publishedAt: page.publishedAt,
      displayedImg: page.displayedImg,
      path: page.path,
      published: page.published,
      blogType: page.blogType,
      badgeColor: page.badgeColor,
      readingTime: page.readingTime,
    }
  }).sort((a, b) => {
    return dayjs((b.publishedAt)) - dayjs((a.publishedAt))
  })
  return parsedPages
})
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
