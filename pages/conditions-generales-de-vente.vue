<template>
  <v-container
    class="py-0 my-0 text-left"
    fluid
  >
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'simple-pages',
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})
</script>
