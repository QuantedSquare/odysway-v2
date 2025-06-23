<template>
  <v-container
    fluid
    class="px-0"
  >
    <v-row
      align="center"
    >
      <v-col
        cols="12"
        xs="7"
        sm="9"
        class="text-h4 my-md-4 font-weight-bold"
      >
        {{ housingTitle }}
      </v-col>
      <v-spacer />
      <v-col
        v-if="displayButton"
        cols="auto"
      >
        <v-btn
          icon
          :color="color"
          :disabled="arrivedState.left"
          class="mr-2"
          elevation="5"
          :size="mdAndUp ? 'default' : 'small'"
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
          :size="mdAndUp ? 'default' : 'small'"
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
        v-if="isHydrated"
        ref="scrollContainer"
        class="flex-nowrap overflow-auto hidden-scroll"
      >
        <v-col
          v-for="housing, index in housingBlock"
          :key="index"
          :cols="housingBlock.length > 1 ? 11 : 12"
          sm="auto"
        >
          <v-card
            variant="text"
            :max-width="770"
          >
            <v-card-text class="text-body-1 text-grey-darken-3 pa-6">
              <v-row>
                <v-col
                  cols="12"
                  md="5"
                  class="d-flex align-start justify-center"
                >
                  <v-carousel
                    height="215"
                    hide-delimiters
                    :show-arrows="true"
                    class="custom-btn-style"
                  >
                    <template #prev="{ props }">
                      <v-btn
                        v-bind="props"
                        :icon="mdiArrowLeft"
                      />
                    </template>
                    <template #next="{ props }">
                      <v-btn
                        v-bind="props"
                        color="transparent"
                        :icon="mdiArrowRight"
                      />
                    </template>
                    <v-carousel-item
                      v-for="image, i in housing.image"
                      :key="image.src + i"
                      rounded="lg"
                      max-height="215"
                    >
                      <template #default>
                        <v-img
                          rounded="lg"
                          cover
                          :src="img(image.src, { format: 'webp', quality: 70, width: 640 })"
                          :alt="image.alt"
                          height="100%"
                        />
                      </template>
                    </v-carousel-item>
                  </v-carousel>
                </v-col>
                <v-col
                  cols="12"
                  md="7"
                >
                  <v-row>
                    <v-col
                      cols="12"
                      class="pb-0"
                    >
                      <h2 class="text-h5 text-center text-md-left d-flex align-center ga-2">
                        <v-badge
                          color="yellow"
                          inline
                          :content="index + 1"
                          text-color="white"
                        />
                        {{ housing.title }}
                      </h2>
                    </v-col>

                    <v-col
                      cols="12"
                      class="housing-text"
                    >
                      <ExpandableText
                        v-if="housing.housingType || housing.housingMood"
                        :clamp-lines="4"
                        :line-height="30"
                        wrapper-class="housing-description"
                      >
                        <div v-if="housing.housingType">
                          <span class="font-weight-bold">{{ housingTypeTitle }}:</span> {{ housing.housingType }}
                        </div>
                        <div v-if="housing.housingMood">
                          <span class="font-weight-bold">{{ housingMoodTitle }}:</span> {{ housing.housingMood }}
                        </div>
                      </ExpandableText>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { mdiArrowLeft, mdiArrowRight, mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { useScroll, useElementSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'

const { housingBlock } = defineProps({
  color: {
    type: String,
    default: 'primary',
  },
  housingBlock: {
    type: Object,
    required: true,
  },
  housingTitle: {
    type: String,
    required: true,
  },
  housingTypeTitle: {
    type: String,
    required: true,
  },
  housingMoodTitle: {
    type: String,
    required: true,
  },
})
const img = useImage()
const { mdAndUp, sm } = useDisplay()
const scrollContainer = ref(null)
const scrollElement = ref(null)
const isHydrated = ref(false)
onMounted(() => {
  isHydrated.value = true
  nextTick(() => {
    scrollElement.value = scrollContainer.value.$el
  })
})

const childrenCount = computed(() => {
  return housingBlock.length
})

const displayButton = computed(() => {
  if (mdAndUp.value) {
    return childrenCount.value >= 2
  }
  else if (sm.value) {
    return childrenCount.value > 2
  }
  return false
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
.housing-text{
font-size: 16px;
line-height: 30px;
}

.custom-btn-style:deep(.v-icon__svg){
  fill: white;
  max-height: 20px!important;
  max-width: 20px!important;
}
.custom-btn-style:deep(.v-btn__underlay){
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2)!important;
}
.custom-btn-style:deep(button){
  height: 24px!important;
  width: 24px!important;
  background: transparent!important;
}
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
</style>
