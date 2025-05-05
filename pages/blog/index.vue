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
          lg="4"
        >
          <BlogCard
            :blog-slug="page.slug"
            :blog-title="page.title"
            :blog-image="page.imgSrc"
            :blog-published="page.published"
            :blog-publication-date="page.publishedAt"
            :blog-type="page.blogType"
            :blog-badge-color="page.badgeColor"
            :blog-reading-time="page.readingTime"
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
      imgSrc: page.displayedImg,
      slug: page.path,
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
