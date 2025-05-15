<template>
  <div v-if="experience">
    <img
      :src="experience.image.src"
      :alt="experience.title"
      height="150"
    >
  </div>
  <div v-else>
    Experience...
  </div>
</template>

<script setup>
const route = useRoute()
const { data: experience } = useAsyncData(route.params.experienceSlug, () => {
  return queryCollection('experiences').where('slug', '=', route.params.experienceSlug).first()
})
</script>
