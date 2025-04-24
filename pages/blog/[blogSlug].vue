<template>
  <v-container
    class="py-0 my-0"
    fluid
  >
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </v-container>
</template>

<script setup>
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('blog').path(route.path).first()
})
// # NEED TO WORK ON SEO
</script>
