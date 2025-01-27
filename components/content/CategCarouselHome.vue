<template>
  <v-container>
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        v-if="showArrows"
        cols="auto"
      >
        <v-icon
          icon="mdi-chevron-left"
          size="large"
          class="hidden-xs hidden-sm"
          @click="scrollCategories(-800)"
        />
      </v-col>
      <v-col
        ref="categList"
        cols="12"
        sm="10"
        class="d-flex overflow-auto hidden-scroll"
      >
        <slot />
      </v-col>
      <v-col
        v-if="showArrows"
        cols="auto"
      >
        <v-icon
          icon="mdi-chevron-right"
          size="large"
          class="hidden-xs hidden-sm"
          @click="scrollCategories(800)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const categList = useTemplateRef('categList')
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
