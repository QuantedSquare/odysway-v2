<template>
  <v-container>
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
          <v-sheet elevation="0">
            <v-card-item>
              <v-card-title class="d-flex align-center ga-2">
                <AvatarImg
                  :avatar-img="review.photo"
                  avatar-size="62"
                />
                <div class="d-flex flex-column">
                  <span class="text-h5"> {{ review.author }}</span>
                  <span class="text-h6 text-grey text-wrap">{{ review.voyageTitle }}</span>
                </div>
              </v-card-title>
              <v-card-subtitle class="mt-4 ">
                <v-icon
                  v-for="i in 5"
                  :key="i"
                  :icon="mdiStar"
                  :color="i <= review.rating ? reviewsSection.ratingColor : 'grey'"
                  size="20"
                />
              </v-card-subtitle>
            </v-card-item>
            <v-card-text class="text-h5 font-weight-bold text-primary">
              "{{ review.text }}
            </v-card-text>
          </v-sheet>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight, mdiStar } from '@mdi/js'
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
const { reviewsSection } = inject('page')
// #TODO REVOIR CE COMPOSANT POUR ajouter faire le lien avec le voyage en plus
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
</style>
