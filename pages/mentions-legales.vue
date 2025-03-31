<template>
  <div class="mt-16">
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </div>
</template>

<script setup>
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})
</script>
