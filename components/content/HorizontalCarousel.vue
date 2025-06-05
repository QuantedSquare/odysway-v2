<template>
  <v-container
    fluid
  >
    <v-row
      align="center"
      class="position-relative px-0"
    >
      <v-col
        cols="12"
        class="text-h2 my-4"
        :class="{ 'text-md-center text-start': centerTitle }"
      >
        <slot name="title" />
      </v-col>
      <v-col
        v-if="displayButton"
        cols="auto"
        class="d-none d-sm-block position-absolute right-0"
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
        :class="reviews && smAndDown? 'flex-wrap' : 'flex-nowrap overflow-auto hidden-scroll'"
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

const props = defineProps({
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
  reviews: {
    type: Boolean,
    default: false,
  },
})

const { mdAndUp, sm, smAndDown } = useDisplay()
const scrollContainer = ref(null)
const scrollElement = ref(null)

const itemsList = useTemplateRef('items-list')
const ctaContainer = useTemplateRef('cta-container')

watch(scrollContainer, () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollElement.value = scrollContainer.value.$el
    }
  })
}, { immediate: true, deep: true })

const gotCtaSlot = computed(() => {
  return ctaContainer.value?.children[0]
})

const childrenCount = computed(() => {
  return itemsList.value?.children[0]?.children.length
})

const displayButton = computed(() => {
  if (mdAndUp.value) {
    return childrenCount.value > 3 && props.showButtons
  }
  else if (sm.value) {
    return childrenCount.value > 2 && props.showButtons
  }
  else {
    return childrenCount.value > 1 && props.showButtons
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
