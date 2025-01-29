<template>
  <v-container class="d-flex align-center">
    <v-icon
      icon="mdi-chevron-left"
      size="x-large"
      class="icon-color"
      @click="scrollVoyages(-400)"
    />

    <v-row
      ref="voyageList"
      class="flex-nowrap overflow-auto hidden-scroll"
    >
      <slot />
    </v-row>
    <v-icon
      icon="mdi-chevron-right"
      size="x-large"
      class="icon-color"
      @click="scrollVoyages(400)"
    />
  </v-container>
</template>

<script setup>
const voyageList = ref(null)

function scrollVoyages(scrollAmount) {
  voyageList.value.$el.scroll({
    left: voyageList.value.$el.scrollLeft + scrollAmount,
    behavior: 'smooth',
  })
}
</script>

<style scoped>
.icon-color {
  color: rgba(0, 0, 0, .54);
}
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
</style>
