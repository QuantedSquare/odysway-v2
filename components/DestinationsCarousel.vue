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

const scrollContainer = useTemplateRef('scrollContainer')
const scrollElement = ref(null)
const nbScrollElementChildren = ref(null)
const { x, arrivedState } = useScroll(scrollElement, { behavior: 'smooth' })
const { width: scrollElementWidth } = useElementSize(scrollElement)

const route = useRoute()

onMounted(() => {
  nextTick(() => {
    console.log('scroll element ', scrollContainer.value.$el)
    scrollElement.value = scrollContainer.value.$el
    console.log('scroll element ', scrollElement.value)
    console.log('scroll element children ', scrollElement.value.children)
    nbScrollElementChildren.value = scrollElement.value.children.length
    console.log('scroll element children ', nbScrollElementChildren.value)
  })
})
console.log('scroll element after unmounted ', scrollElement.value)

const scrollAmount = computed(() => {
  return 400
})

const displayScrollBtn = computed(() => {
  console.log('scroll element width ', scrollElementWidth.value)
  console.log('cumulate children width ', nbScrollElementChildren.value * 120)
  console.log('show scroll btn ? ', displayScrollBtn.value)
  return (nbScrollElementChildren.value * 120) > scrollElementWidth.value
})

// si x > 0 et new route.path => remettre x à 0
function setXtoZero() {
  x.value = 0
}
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
</style>
