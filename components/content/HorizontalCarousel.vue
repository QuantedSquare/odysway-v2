<template>
  <v-container
    class="d-flex align-center position-relative"
  >
    <VBtnVoyage
      v-if="!arrivedState.left"
      icon
      class="position-absolute left-0 zIndex"
      @click="x -= Number(scrollAmount)"
    >
      <VIconChevron
        icon="mdi-chevron-left"
      />
    </VBtnVoyage>
    <v-row
      ref="scrollContainer"
      class="flex-nowrap overflow-auto hidden-scroll"
    >
      <slot />
    </v-row>
    <VBtnVoyage
      v-if="!arrivedState.right"
      icon
      class="position-absolute right-0"
      @click="x += Number(scrollAmount)"
    >
      <VIconChevron
        icon="mdi-chevron-right"
      />
    </VBtnVoyage>
  </v-container>
</template>

<script setup>
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
