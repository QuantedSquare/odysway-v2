<template>
  <v-container class="d-flex align-center position-relative">
    <VBtnVoyage
      v-if="!arrivedState.left"
      icon
      class="position-absolute left-0 zIndex"
    >
      <VIconChevron
        icon="mdi-chevron-left"

        @click="x -= 300"
      />
    </VBtnVoyage>
    <v-row
      ref="voyageList"
      class="flex-nowrap overflow-auto hidden-scroll"
    >
      <slot />
    </v-row>

    <VBtnVoyage
      v-if="!arrivedState.right"
      icon
      class="position-absolute right-0"
    >
      <VIconChevron
        icon="mdi-chevron-right"
        @click="x += 300"
      />
    </VBtnVoyage>
  </v-container>
</template>

<script setup>
import { useScroll } from '@vueuse/core'

const voyageList = ref(null)
const scrollElement = ref(null)

onMounted(() => {
  scrollElement.value = voyageList.value.$el
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
