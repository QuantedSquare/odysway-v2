<template>
  <v-carousel
    ref="accomodation-carousel"
    height="300"
    :show-arrows="nbCarouselItems > 1 ? true : false "
    :cycle="nbCarouselItems > 1 ? true : false"
    hide-delimiters
  >
    <template #prev="{ props }">
      <v-btn
        variant="elevated"
        :icon="mdiChevronLeft"
        color="black opacity-40"
        @click="props.onClick"
      />
    </template>
    <template #next="{ props }">
      <v-btn
        variant="elevated"
        :icon="mdiChevronRight"
        color="black opacity-40"
        @click="props.onClick"
      />
    </template>
    <slot name="images" />
  </v-carousel>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

const accomodationCarousel = useTemplateRef('accomodation-carousel')
const nbCarouselItems = ref(0)

onMounted(() => {
  nbCarouselItems.value = accomodationCarousel.value?.$el.children[0]?.children?.length - 1
})
</script>

<style scoped>
.v-window {
  border-radius: 8px !important;
}
</style>
