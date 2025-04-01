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
        @click="x-=scrollAmount"
      >
        <v-icon
          :icon="mdiChevronLeft"
          color="primary"
        />
      </v-btn>
    </v-col>
    <v-col cols="10">
    <div
      ref="scrollContainer"
      class="d-flex flex-nowrap overflow-auto hidden-scroll"
    >
    <div 
    v-for="country of props.destinations"
    :key="country.country">
      <v-card
        :image="country.image"
        :href="`/destinations/${country.slug}`"
        min-height="120"
        min-width="120"
        class="mr-2">
            <v-card-title class="position-absolute bottom-0 text-subtitle-1 font-weight-bold text-white no-white-space text-shadow">
              {{ country.country }}
            </v-card-title>
          </v-card>
    </div>
  </div>
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
      @click="x+=scrollAmount"
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

const props = defineProps({
  destinations: {
    type: Array,
    default: () => [],
  },
})

const scrollAmount = 400
const route = useRoute()
const scrollContainer = useTemplateRef('scrollContainer')

const { x, arrivedState, measure } = useScroll(scrollContainer, { behavior: 'smooth' })
const { width: scrollElementWidth } = useElementSize(scrollContainer)

watch(() => route.path, () => {
  x.value = 0
  measure()
})

const displayScrollBtn = computed(() => (props.destinations.length * 120) > scrollElementWidth.value)
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
</style>
