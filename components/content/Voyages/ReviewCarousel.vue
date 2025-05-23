<template>
  <v-container v-show="reviews.length > 0">
    <v-row
      align="center"
    >
      <v-col
        cols="6"
        xs="7"
        sm="9"
        class="text-h4 my-4 font-weight-bold"
        :class="{ 'text-md-center text-start': centerTitle }"
      >
        {{ reviewsSection.title }}
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
        <v-col
          v-for="review in reviews"
          :key="review.id"
          cols="12"
          sm="6"
          md="4"
        >
          <ReviewTraveller :review="review" />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { useScroll, useElementSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'

const route = useRoute()
defineProps({
  centerTitle: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'primary',
  },
  reviewsSection: {
    type: Object,
    required: true,
  },
})
const { mdAndUp, sm } = useDisplay()
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
const { data: reviews } = await useAsyncData('reviews', () => {
  return queryCollection('reviews').where('voyageSlug', '=', route.params.voyageSlug).all()
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
