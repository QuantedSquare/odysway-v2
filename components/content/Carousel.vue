<template>
  <v-carousel
    ref="carousel"
    height="300"
    :cycle="nbCarouselItems > 1 ? true : false"
    interval="10000"
    hide-delimiter-background
    :hide-delimiters="nbCarouselItems > 1 ? false : true"
    color="grey-lighten-4"
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
    <slot name="carousel-item" />
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
  </v-carousel>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

const carousel = useTemplateRef('carousel')
const nbCarouselItems = ref(0)

onMounted(() => {
  nbCarouselItems.value = carousel.value?.$el.children[0]?.children?.length
})
</script>

<style scoped>
.v-window {
  border-radius: 8px !important;
}
</style>
