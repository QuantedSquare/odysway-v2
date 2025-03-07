<template>
  <v-container>
    <v-row
      align="center"
    >
      <v-col
        cols="12"
        sm="auto"
        class="text-dark font-weight-black text-h5 text-md-h4 my-4"
      >
        <slot name="title" />
      </v-col>
      <v-spacer />
      <v-col
        v-show="displayButton"
        cols="auto"
      >
        <v-btn
          icon
          density="compact"
          color="primary"
          variant="outlined"
          :disabled="arrivedState.left"
          class="mr-2"
          @click="x -= scrollAmount"
        >
          <v-icon
            :icon="mdiChevronLeft"
            color="primary"
          />
        </v-btn>
        <v-btn
          icon
          density="compact"
          color="primary"
          variant="outlined"
          :disabled="arrivedState.right"
          @click="x += scrollAmount"
        >
          <v-icon
            :icon="mdiChevronRight"
            color="primary"
          />
        </v-btn>
      </v-col>
    </v-row>
    <div ref="items-list">
      <v-row
        ref="scrollContainer"
        class="flex-nowrap overflow-auto hidden-scroll"
      >
        <slot
          name="carousel-item"
        />
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { useScroll, useElementSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'

const { lgAndUp, md, sm } = useDisplay()

const scrollContainer = ref(null)
const scrollElement = ref(null)

const itemsList = useTemplateRef('items-list')

onMounted(() => {
  nextTick(() => {
    scrollElement.value = scrollContainer.value.$el
  })
})

const childrenCount = computed(() => {
  return itemsList.value?.children[0].children.length
})

const displayButton = computed(() => {
  if (lgAndUp.value) {
    return childrenCount.value > 4
  }
  else if (md.value) {
    return childrenCount.value > 3
  }
  else if (sm.value) {
    return childrenCount.value > 2
  }
  else {
    return childrenCount.value > 1
  }
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
