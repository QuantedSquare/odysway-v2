<template>
  <v-container :fluid="width <= 1440 ">
    <v-row justify="space-between">
      <v-col
        cols="12"
        sm="6"
        class="text-center text-sm-start text-h2 text-primary"
      >
        <slot name="title" />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        class="text-center text-sm-right"
      >
        <slot name="cta-button" />
      </v-col>
    </v-row>
    <v-row v-if="mergedData">
      <v-col
        v-for="(blog, index) in mergedData"
        :key="index"
        cols="12"
        sm="6"
        md="4"
      >
        <BlogCard
          v-bind="blog"
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

const mergedData = await Promise.all([
  queryCollection('blog').path(props.blogCardSlug1).first(),
  queryCollection('blog').path(props.blogCardSlug2).first(),
  queryCollection('blog').path(props.blogCardSlug3).first(),
])
</script>
