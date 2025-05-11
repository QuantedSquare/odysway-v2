<template>
  <div>
    <v-container>
      <v-row
        justify="center"
        align="center"
        no-gutters
      >
        <v-col
          ref="scroll-target"
          class="font-weight-black text-h2 my-4"
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
      <v-row
        v-else
      >
        <v-col
          v-for="page in paginatedBlogs"
          :key="page.slug"
          cols="12"
          sm="6"
          lg="4"
        >
          <BlogCard
            v-bind="page"
          />
        </v-col>
        <v-col cols="12">
          <v-pagination
            v-model="pagination.currentPage"
            :length="nbPages"
            :total-visible="7"
            variant="flat"
            density="comfortable"
            rounded="circle"
            active-color="primary"
            elevation="3"
            class="my-4"
            @click="goTo(scrollTarget, { offset: -100, duration: 1000, easing: 'easeInOutCubic' })"
            @next="pagination.currentPage = pagination.currentPage++"
            @prev="pagination.currentPage = pagination.currentPage-- "
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { useGoTo } from 'vuetify'

const route = useRoute()
const { data: pages, status } = useAsyncData(route.path, () => {
  return queryCollection('blog').all()
})

const loading = computed(() => {
  return status.value !== 'success'
})

const parsedPages = computed(() => {
  const parsedPages = pages.value?.map((page) => {
    console.log('page', page)
    return {
      title: page.title,
      publishedAt: page.publishedAt,
      displayedImg: page.displayedImg,
      path: page.path.replace('/blog/', ''),
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

const goTo = useGoTo()
const scrollTarget = useTemplateRef('scroll-target')

const pagination = ref({
  currentPage: 1,
  itemsPerPage: 12,
})

const paginatedBlogs = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage
  const end = pagination.value.currentPage * pagination.value.itemsPerPage
  return parsedPages.value.slice(start, end)
})

const nbPages = computed(() => {
  return Math.ceil(parsedPages.value.length / pagination.value.itemsPerPage)
})

watch(() => parsedPages.value, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    pagination.value.currentPage = 1
  }
})

watch(() => parsedPages.value, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    pagination.value.currentPage = 1
  }
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
