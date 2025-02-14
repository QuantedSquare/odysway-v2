<template>
  <div>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </div>
</template>

<script setup>
const route = useRoute()
const { data: page } = useAsyncData(route.path, () => {
  return queryCollection('content').path('/').first()
})
</script>
