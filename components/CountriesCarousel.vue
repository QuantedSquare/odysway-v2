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
    <v-col
      cols="8"
      md="10"
    >
      <div
        ref="scrollContainer"
        class="d-flex flex-nowrap overflow-auto hidden-scroll"
      >
        <div
          v-for="country of countries"
          :key="country.country"
        >
          <v-card
            :image="country.image"
            min-height="120"
            min-width="120"
            class="mr-2"
            @click="(event) => {
              selectCountry(country.slug);
              navigateToCountry(country.slug, event);
            }"
          >
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
import { useRoute } from 'vue-router'
import { useScroll, useElementSize } from '@vueuse/core'

const props = defineProps({
  countries: {
    type: Array,
    default: () => [],
  },
})

const route = useRoute()

const model = defineModel('slug')

function selectCountry(slug) {
  model.value = slug
  console.log('carousel selected country ', model.value)
}

function navigateToCountry(slug, event) {
  if (route.path.includes('destinations')) {
    event.preventDefault()
    navigateTo(`/destinations/${slug}`)
  }
  else {
    navigateTo(`/destinations/${slug}`)
  }
}

const scrollAmount = 128 * 3
const scrollContainer = useTemplateRef('scrollContainer')

const { x, arrivedState, measure } = useScroll(scrollContainer, { behavior: 'smooth' })
const { width: scrollElementWidth } = useElementSize(scrollContainer)

watch(() => route.path, () => {
  x.value = 0
  measure()
})

const displayScrollBtn = computed(() => (props.countries.length * 128) > scrollElementWidth.value)
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
</style>
