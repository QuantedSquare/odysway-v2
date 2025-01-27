<template>
  <v-card
    variant="flat"
    width="150"
    height="150"
    rounded="lg"
    :image="categorie?.image"
  >
    <span
      style="text-shadow: 2px 2px 4px rgba(0, 0, 0, .3)"
      class="text-white font-weight-bold position-absolute bottom-0 pa-2"
    >
      {{ categorie?.title || 'Loading ... ' }}
    </span>
  </v-card>
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
