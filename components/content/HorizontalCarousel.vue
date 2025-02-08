<template>
  <v-container
    class="d-flex align-center position-relative"
  >
    <v-btn-voyage
      v-if="!arrivedState.left"
      icon
      class="position-absolute left-0 zIndex"
      @click="x -= Number(scrollAmount)"
    >
      <v-icon-chevron
        :icon="mdiChevronLeft"
      />
    </v-btn-voyage>
    <v-row
      ref="scrollContainer"
      class="flex-nowrap overflow-auto hidden-scroll"
    >
      <slot />
    </v-row>
    <v-btn-voyage
      v-if="!arrivedState.right"
      icon
      class="position-absolute right-0"
      @click="x += Number(scrollAmount)"
    >
      <v-icon-chevron
        :icon="mdiChevronRight"
      />
    </v-btn-voyage>
  </v-container>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { useScroll } from '@vueuse/core'

defineProps({
  scrollAmount: {
    type: String,
    required: true,
    default: '400',
  },
})
const scrollContainer = ref(null)
const scrollElement = ref(null)

onMounted(() => {
  scrollElement.value = scrollContainer.value.$el
})
const { x, arrivedState } = useScroll(scrollElement, { behavior: 'smooth' })
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
.zIndex {
  z-index: 100;
}
</style>
