<template>
  <v-container :fluid="width < 1440 ">
    <v-row justify="space-between">
      <v-col class="text-h2 text-primary">
        <slot name="title" />
      </v-col>
      <v-col class="text-right">
        <slot name="cta-button" />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-for="(blog, index) in mergedData"
        :key="index"
        cols="12"
        sm="6"
        md="4"
      >
        <BlogCard
          :blog-slug="blog.path"
          :blog-title="blog.title"
          :blog-image="blog.displayedImg"
          :blog-published="blog.published"
          :blog-date="blog.publishedAt"
          :blog-type="blog.blogType"
          :blog-badge-color="blog.badgeColor"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const props = defineProps({
  blogCardSlug1: {
    type: String,
  },
  blogCardSlug2: {
    type: String,
  },
  blogCardSlug3: {
    type: String,
  },
})

const { width } = useDisplay()

const [
  { data: blog1 },
  { data: blog2 },
  { data: blog3 },
] = await Promise.all([
  useAsyncData('blog1', () => queryCollection('blog').path(props.blogCardSlug1).first()),
  useAsyncData('blog2', () => queryCollection('blog').path(props.blogCardSlug2).first()),
  useAsyncData('blog3', () => queryCollection('blog').path(props.blogCardSlug3).first()),
])

const mergedData = computed(() => {
  return [blog1.value, blog2.value, blog3.value]
})
</script>
