<template>
  <v-container class="d-flex align-center">
    <VIconChevron
      v-if="!arrivedState.left"
      icon="mdi-chevron-left"
      @click="x -= 300"
    />
    <v-row
      ref="voyageList"
      class="flex-nowrap overflow-auto hidden-scroll"
      :class="arrivedState.right ? 'mr-6' : ''"
    >
      <slot />
    </v-row>
    <VIconChevron
      v-if="!arrivedState.right"
      icon="mdi-chevron-right"
      @click="x += 300"
    />
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
</style>
