<template>
  <v-row
    justify="center"
  >
    <v-col
      cols="auto"
      class="d-flex align-center"
    >
      <v-btn
        icon
        density="compact"
        color="primary"
        variant="outlined"
        :disabled="arrivedState.left"
        class="mr-2"
        :class="displayScrollBtn ? 'd-inline' : 'd-none'"
        @click="x -= scrollAmount"
      >
        <v-icon
          :icon="mdiChevronLeft"
          color="primary"
        />
      </v-btn>
    </v-col>
    <v-col
      ref="scrollContainer"
      cols="10"
      class="d-flex flex-nowrap overflow-auto hidden-scroll"
    >
      <slot
        name="carousel-item"
      />
    </v-col>
    <v-col
      cols="auto"
      class="d-flex align-center"
    >
      <v-btn
        icon
        density="compact"
        color="primary"
        variant="outlined"
        :disabled="arrivedState.right"
        :class="displayScrollBtn ? 'd-inline' : 'd-none'"
        @click="x += scrollAmount"
      >
        <v-icon
          :icon="mdiChevronRight"
          color="primary"
        />
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { useScroll, useElementSize } from '@vueuse/core'
import { useRoute } from 'vue-router'

const route = useRoute()
const scrollContainer = ref(null)
const scrollElement = ref(null)
const nbScrollElementChildren = ref(0)
const { x, arrivedState } = useScroll(scrollElement, { behavior: 'smooth' })
const { width: scrollElementWidth } = useElementSize(scrollElement)

watch(() => route.path, () => {
  if (x.value > 0) {
    x.value = 0
  }
})

onMounted(() => {
  nextTick(() => {
    // Get the actual DOM element from the Vuetify component
    scrollElement.value = scrollContainer.value.$el
    updateChildrenCount()

    // Set up a MutationObserver to watch for changes in the container
    const observer = new MutationObserver(() => {
      updateChildrenCount()
    })

    // Ensure we have a valid DOM node before observing
    if (scrollElement.value instanceof Node) {
      observer.observe(scrollElement.value, {
        childList: true,
        subtree: true,
      })
    }
    else {
      console.warn('Scroll element is not a valid DOM node:', scrollElement.value)
    }
  })
})

watch(() => scrollElement.value, (newElement) => {
  if (newElement instanceof Node) {
    updateChildrenCount()
  }
}, { deep: true })

function updateChildrenCount() {
  if (scrollElement.value?.children) {
    const count = scrollElement.value.children.length
    nbScrollElementChildren.value = count
  }
}

const scrollAmount = computed(() => {
  return 400
})

const displayScrollBtn = computed(() => {
  return (nbScrollElementChildren.value * 120) > scrollElementWidth.value
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
