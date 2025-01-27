<template>
  <NuxtLink
    :key="categorieSlug"
    :to="`/thematiques/${categorieSlug}`"
    class="mr-4"
  >
    <v-card
      variant="flat"
      width="150"
      height="150"
      rounded="lg"
      :image="categorie?.image"
    >
      <span class="shadow text-white font-weight-bold position-absolute bottom-0 pa-2">
        {{ categorie?.title || 'Loading ... ' }}
      </span>
    </v-card>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  categorieSlug: {
    type: String,
    required: true,
  },
})
const { data: categorie } = await useAsyncData(`categorie-${props.categorieSlug}`, () => {
  return queryCollection('categories').where('slug', '=', props.categorieSlug).first()
})
</script>

<style scoped>
 .shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, .3)
  }
</style>
