<template>
  <v-container
    class="py-0 my-0"
    fluid
  >
    <ContentRenderer
      v-if="data"
      :value="data"
    />
  </v-container>
</template>

<script setup>
const route = useRoute()
console.log('route', route.path)
const { data } = await useAsyncData(route.path, () => {
  return queryCollection('blog').path('/blog' + route.path).first()
})

provide('page', data)
</script>
