<template>
  <v-carousel
    ref="accomodation-carousel"
    height="300"
    :show-arrows="nbCarouselItems > 1 ? 'hover' : false "
    :cycle="nbCarouselItems > 1 ? true : false"
    hide-delimiters
  >
    <template #prev="{ props }">
      <v-btn
        density="compact"
        icon
        color="grey-lighten-4 opacity-60"
        @click="props.onClick"
      >
        <v-icon
          :icon="mdiChevronLeft"
          color="grey-darken-3"
        />
      </v-btn>
    </template>
    <template #next="{ props }">
      <v-btn
        density="compact"
        icon
        color="grey-lighten-4 opacity-60"
        @click="props.onClick"
      >
        <v-icon
          :icon="mdiChevronRight"
          color="grey-darken-3"
        />
      </v-btn>
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
