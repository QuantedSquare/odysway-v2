<template>
  <v-container
    class="d-flex align-center position-relative"
  >
    <VBtnVoyage
      v-if="!arrivedState.left"
      :class="$vuetify.display.smAndDown ? 'd-none' : ''"
      icon
      class="position-absolute left-0 zIndex"
    >
      <VIconChevron
        icon="mdi-chevron-left"

        @click="x -= 800"
      />
    </VBtnVoyage>
    <v-row
      ref="categList"
      class="flex-nowrap overflow-auto hidden-scroll"
    >
      <slot />
    </v-row>
    <VBtnVoyage
      v-if="!arrivedState.right"
      :class="$vuetify.display.smAndDown ? 'd-none' : ''"
      icon
      class="position-absolute right-0"
    >
      <VIconChevron
        icon="mdi-chevron-right"
        @click="x += 800"
      />
    </VBtnVoyage>
  </v-container>
</template>

<script setup>
import { useScroll } from '@vueuse/core'

const categList = ref(null)
const scrollElement = ref(null)

onMounted(() => {
  scrollElement.value = categList.value.$el
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
