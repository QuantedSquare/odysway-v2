<template>
  <v-container>
    <v-row
      align="center"
    >
      <v-col
        cols="6"
        xs="7"
        sm="9"
        class="text-h2 my-4"
        :class="{ 'text-md-center text-start': centerTitle }"
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
          :color="color"
          :disabled="arrivedState.left"
          class="mr-2"
          elevation="5"
          :size="mdAndUp ? 'large' : 'small'"
          @click="x -= scrollAmount"
        >
          <v-icon
            :icon="mdiChevronLeft"
            color="white"
          />
        </v-btn>
        <v-btn
          icon
          :color="color"
          :disabled="arrivedState.right"
          elevation="5"
          :size="mdAndUp ? 'large' : 'small'"
          @click="x += scrollAmount"
        >
          <v-icon
            :icon="mdiChevronRight"
            color="white"
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
    <v-row
      v-show="gotCtaSlot"
      justify="center"
      no-gutters
    >
      <v-col
        cols="4"
        class="d-flex justify-center"
      >
        <div
          ref="cta-container"
          class="mt-md-16 d-flex justify-center"
        >
          <slot name="cta" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { useScroll, useElementSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'

defineProps({
  centerTitle: {
    type: Boolean,
    default: false,
  },
  showButtons: {
    type: Boolean,
    default: true,
  },
  color: {
    type: String,
    default: 'primary',
  },
})
const { mdAndUp, sm, width } = useDisplay()
const scrollContainer = ref(null)
const scrollElement = ref(null)

const itemsList = useTemplateRef('items-list')
const ctaContainer = useTemplateRef('cta-container')

onMounted(() => {
  nextTick(() => {
    scrollElement.value = scrollContainer.value.$el
  })
})
const gotCtaSlot = computed(() => {
  return ctaContainer.value?.children[0]
})

const childrenCount = computed(() => {
  return itemsList.value?.children[0]?.children.length
})

const displayButton = computed(() => {
  if (mdAndUp.value) {
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
  if (scrollContainerWidth.value && scrollContainerWidth.value >= 892) {
    return 400
  }
  else {
    return scrollContainerWidth?.value || 0
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
