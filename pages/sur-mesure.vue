<template>
  <div>
    <ContentRenderer
      v-if="page && status === 'success'"
      :value="page"
    />
    <div
      v-else-if="status === 'pending'"
      class="d-flex justify-center align-center"
    >
      <v-progress-circular indeterminate />
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: page, status } = useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})
</script>
