<template>
  <v-carousel
    ref="avis-carousel"
    class="h-100 pb-12"
    :show-arrows="false"
    hide-delimiter-background
    :hide-delimiters="nbCarouselItems > 1 ? false : true"
    color="grey-lighten-4"
  >
    <slot name="carousel-item" />
  </v-carousel>
</template>

<script setup>
const carousel = useTemplateRef('avis-carousel')
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
