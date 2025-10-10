<template>
  <v-container

    id="reviews-container"
    :fluid="width < 1600"
    class="px-0 py-0 mb-4"
  >
    <ClientOnly>
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          md="10"
          class="text-h4 my-4 font-weight-bold px-5 px-md-0"
          :class="{ 'text-md-center text-start': centerTitle }"
        >
          {{ reviewsSection.title }}
        </v-col>
        <v-spacer />
        <v-col
          v-if="displayButton"
          cols="12"
          md="auto"
          class="d-flex ga-2"
        >
          <CustomChevronBtn
            :arrived-state="arrivedState.left"
            :color="color"
            orientation="left"
            @click="x -= scrollAmount"
          />
          <CustomChevronBtn
            :arrived-state="arrivedState.right"
            :color="color"
            orientation="right"
            @click="x += scrollAmount"
          />
        </v-col>
      </v-row>
    </ClientOnly>
    <div ref="itemsList">
      <v-row
        v-if="smAndUp"
        ref="scrollContainer"
        class="flex-nowrap overflow-auto hidden-scroll mb-4"
      >
        <!-- <v-col
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
        </v-col> -->
      </v-row>
      <v-row
        v-else
        class="mb-8"
      >
        <!-- <v-col
          v-for="review in reviews.slice(0, 3)"
          :key="review.id"
          cols="12"
          class="pb-0"
        >
          <ReviewTraveller
            :review="review"
            :is-travel-page="true"
          />
        </v-col> -->
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
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

const { mdAndUp, smAndUp, width } = useDisplay()
const scrollContainer = ref(null)
const scrollElement = ref(null)
const itemsList = ref(null)

const reviewsQuery = `
  *[_type == "review" && voyage->slug.current == $voyageSlug]{
    _id,
    author,
    authorAge,
    date,
    photo,
    rating,
    text,
    voyage->{
      _id,
      title,
      slug
    }
  }
`

const { data: reviewsSanity } = useSanityQuery(reviewsQuery, {
  voyageSlug: route.params.voyageSlug },
{
  key: 'reviews-' + route.params.voyageSlug,
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})
const reviews = computed(() => {
  return _.uniqBy(reviewsSanity.value, 'text') || []
})
// Initialize scroll setup function
const setupScrollElement = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      const element = scrollContainer.value.$el || scrollContainer.value
      if (element && element.scrollWidth > element.clientWidth) {
        scrollElement.value = element
      }
    }
  })
}
// Setup scroll on mount
onMounted(() => {
  setupScrollElement()
})

// Re-setup when reviews data changes (important for refresh)
watch(() => reviews.value, (newReviews) => {
  if (newReviews && newReviews.length > 0) {
    // DOM update with new reviews
    nextTick()
  }
})

// Watch for scroll container changes
watch(() => scrollContainer.value, () => {
  if (scrollContainer.value) {
    setupScrollElement()
  }
})

const displayButton = computed(() => {
  return mdAndUp.value && reviews.value && reviews.value.length > 3
})

const { x, arrivedState } = useScroll(scrollElement, {
  behavior: 'smooth',
})

const { width: scrollContainerWidth } = useElementSize(scrollContainer)

const scrollAmount = computed(() => {
  // 892 is a scroll container width on md breakpoint
  if (scrollContainerWidth.value && scrollContainerWidth.value >= 892) {
    return 400
  }
  return scrollContainerWidth?.value || 300
})
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}

.carousel-nav-btn:disabled {
  color: white !important;
}

.disabled-shadow {
  box-shadow: 0px 6px 16px 0px #2222231A!important;
}
</style>
