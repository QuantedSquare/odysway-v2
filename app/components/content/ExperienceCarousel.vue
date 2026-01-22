<template>
  <v-container
    class="rounded-lg py-4 py-md-8 px-0 px-md-8 mt-4 mt-md-8 max-container-width"
    fluid
  >
    <LazyHorizontalCarousel
      v-if="experiences"
      :show-buttons="experiences.length > 4"
    >
      <template #title>
        <slot name="title" />
      </template>
      <template #carousel-item>
        <ThematiqueColCard
          v-for="experience in experiences"
          v-show="experience.showOnHome"
          :key="experience.id"
          :slug="experience.slug"
          :image="experience.image"
          :title="experience.title"
          :description="experience.discoveryTitle"
          type="experiences"
          promotion-name="Expériences à vivre"
        />
      </template>
    </LazyHorizontalCarousel>
  </v-container>
</template>

<script setup>
const props = defineProps({
  experiencesData: {
    type: Array,
    required: true,
  },
})

const { trackViewPromotion } = useGtmTracking()

const experiences = computed(() => {
  return props.experiencesData.map(exp => ({
    id: exp._id,
    title: exp.title,
    slug: exp.slug.current,
    discoveryTitle: exp.discoveryTitle,
    showOnHome: exp.showOnHome,
    image: exp.image,
  }))
})

// Track view_promotion when component is mounted
onMounted(() => {
  trackViewPromotion('Expériences à vivre')
})
</script>
