<template>
  <v-container class="pt-0">
    <v-row
      align="center"
      no-gutters
    >
      <v-col
        cols="12"
        sm="auto"
        class="text-dark font-weight-black text-h5 text-md-h4 my-4"
      >
        <slot name="title" />
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn
          icon
          density="compact"
          color="transparent"
          variant="outlined"
          :disabled="arrivedState.left"
          class="mr-1"
          @click="x -= scrollAmount"
        >
          <v-icon
            :icon="mdiChevronLeft"
            color="grey-darken-3"
          />
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn
          icon
          density="compact"
          color="transparent"
          variant="outlined"
          :disabled="arrivedState.right"
          class="ml-1"
          @click="x += scrollAmount"
        >
          <v-icon
            :icon="mdiChevronRight"
            color="grey-darken-3"
          />
        </v-btn>
      </v-col>
    </v-row>

    <v-row
      ref="scrollContainer"
      class="flex-nowrap overflow-auto hidden-scroll"
    >
      <slot
        name="carousel-item"
      />
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { useScroll, useElementSize } from '@vueuse/core'

const scrollContainer = ref(null)
const scrollElement = ref(null)

onMounted(() => {
  scrollElement.value = scrollContainer.value.$el
})

const { x, arrivedState } = useScroll(scrollElement, { behavior: 'smooth' })
const { width: scrollContainerWidth } = useElementSize(scrollContainer)

const scrollAmount = computed(() => {
  // 892 is a scroll container width on md breakpoint
  if (scrollContainerWidth.value >= 892) {
    return 400
  }
  else {
    return scrollContainerWidth.value
  }
})
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
</style>
