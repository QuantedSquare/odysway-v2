<template>
  <v-col cols="auto">
    <NuxtLink
      :key="categorieSlug"
      :to="`/thematiques/${categorieSlug}`"
    >
      <v-card
        variant="flat"
        width="150"
        height="150"
        rounded="lg"
      >
        <template #image>
          <v-img :src="img(categorie?.image, { format: 'webp', quality: 70, width: 200, height: 200 })" />
        </template>
        <span class="shadow text-white font-weight-bold position-absolute bottom-0 pa-2">
          {{ categorie.title }}
        </span>
      </v-card>
    </NuxtLink>
  </v-col>
</template>

<script setup>
import { useImage } from '#imports'

const props = defineProps({
  categorieSlug: {
    type: String,
    required: true,
  },
})

const img = useImage()

const { data: categorie } = await useAsyncData(`categorie-${props.categorieSlug}`, () => {
  return queryCollection('categories').where('slug', '=', props.categorieSlug).first()
})
</script>

<style scoped>
 .shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, .3)
  }
</style>
