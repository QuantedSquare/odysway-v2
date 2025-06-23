<template>
  <v-container
    v-show="reviews.length > 0"
    id="reviews-container"
    :fluid="width < 1600"
    class="px-0 py-0"
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        md="10"
        class="text-h4 my-4 font-weight-bold"
        :class="{ 'text-md-center text-start': centerTitle }"
      >
        {{ reviewsSection.title }}
      </v-col>
      <v-spacer />
      <v-col
        v-show="displayButton"
        cols="12"
        md="auto"
      >
        <v-btn
          icon
          :color="arrivedState.left ? 'white' : color"
          :disabled="arrivedState.left"
          class="mr-2 carousel-nav-btn"
          elevation="5"
          :size="mdAndUp ? 'large' : 'small'"
          @click="x -= scrollAmount"
        >
          <v-icon
            :icon="mdiChevronLeft"
            :color="arrivedState.left ? color : 'white'"
          />
        </v-btn>
        <v-btn
          icon
          :color="arrivedState.right ? 'white' : color"
          :disabled="arrivedState.right"
          class="carousel-nav-btn"
          elevation="5"
          :size="mdAndUp ? 'large' : 'small'"
          @click="x += scrollAmount"
        >
          <v-icon
            :icon="mdiChevronRight"
            :color="arrivedState.right ? color : 'white'"
          />
        </v-btn>
      </v-col>
    </v-row>
    <div ref="items-list">
      <v-row
        ref="scrollContainer"
        class="flex-nowrap overflow-auto hidden-scroll"
      >
        <v-col
          v-for="review in reviews"
          :key="review.id"
          cols="10"
          sm="6"
          md="4"
        >
          <ReviewTraveller
            :review="review"
            :is-travel-page="true"
          />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { useScroll, useElementSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import _ from 'lodash'

const route = useRoute()
defineProps({
  centerTitle: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'secondary',
  },
  reviewsSection: {
    type: Object,
    required: true,
  },
})
const { mdAndUp, sm, width } = useDisplay()
const scrollContainer = ref(null)
const scrollElement = ref(null)

const itemsList = useTemplateRef('items-list')

onMounted(() => {
  nextTick(() => {
    scrollElement.value = scrollContainer.value.$el
  })
})

const childrenCount = computed(() => {
  return itemsList.value?.children[0]?.children.length
})

const displayButton = computed(() => {
  if (mdAndUp.value) {
    return childrenCount.value > 3
  }
  else if (sm.value) {
    return false
  }
  else {
    return false
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
const { data: reviews } = await useAsyncData('reviews', async () => {
  const collection = await queryCollection('reviews').where('voyageSlug', '=', route.params.voyageSlug).all()
  return _.uniqBy(collection, 'text')
})
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}

.carousel-nav-btn:disabled {
  color: white !important;
}
</style>
