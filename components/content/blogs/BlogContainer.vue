<template>
  <v-container>
    <v-row>
      <slot name="blog-col" />
    </v-row>
  </v-container>
</template>

<script setup>
const route = useRoute()

const { data: pages } = await useAsyncData('', () => {
  return queryCollection('content').path(`${route.path}/blogs`).all()
})

console.log(pages.value)

console.log(route.path)
</script>
