<template>
  <v-container
    class="d-flex align-center"
  >
    <div
      v-if="showArrows"
      :class="$vuetify.display.smAndDown ? 'd-none' : ''"
    >
      <v-icon
        icon="mdi-chevron-left"
        size="large"
        @click="scrollCategories(-800)"
      />
    </div>
    <v-row
      ref="categList"
      class="flex-nowrap overflow-auto hidden-scroll"
    >
      <!-- <v-col class="d-flex"> -->
      <slot />
      <!-- </v-col> -->
    </v-row>
    <div
      v-if="showArrows"
      :class="$vuetify.display.smAndDown ? 'd-none' : ''"
    >
      <v-icon
        icon="mdi-chevron-right"
        size="large"
        @click="scrollCategories(800)"
      />
    </div>
  </v-container>
</template>

<script setup>
const categList = ref(null)
const showArrows = ref(false)

onMounted(() => {
  showArrows.value = categList.value.$el.scrollWidth > categList.value.$el.clientWidth
})

function scrollCategories(scrollAmount) {
  categList.value.$el.scroll({
    left: categList.value.$el.scrollLeft + scrollAmount,
    behavior: 'smooth',
  })
}
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
</style>
