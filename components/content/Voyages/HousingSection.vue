<template>
  <v-container
    fluid
    class="px-0 py-0"
  >
    <v-row
      align="center"
      class="px-2 px-md-0"
    >
      <v-col
        v-if="housingBlock && housingBlock.length > 0"
        cols="12"
        xs="7"
        sm="9"
        class="text-h4 mb-0  mt-2 mb-2 mb-md-6 font-weight-bold "
      >
        {{ housingTitle }}
      </v-col>
      <v-spacer />
      <v-col
        v-if="displayButton"
        cols="auto"
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
    <div ref="items-list">
      <v-row
        v-if="isHydrated"
        ref="scrollContainer"
        class="flex-nowrap overflow-auto hidden-scroll"
      >
        <v-col
          v-for="housing, index in housingBlock || []"
          :key="index"
          :cols="childrenCount > 1 ? 11 : 12"
          md="auto"
        >
          <v-card
            variant="text"
            :max-width="770"
          >
            <v-card-text class="text-body-1 text-grey-darken-3 pa-md-6">
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
                      :key="image._key + i"
                      rounded="lg"
                      max-height="215"
                    >
                      <template #default>
                        <v-img
                          rounded="lg"
                          cover
                          :src="img(getImageUrl(image?.asset?._ref), { format: 'webp', quality: 70, width: 640 })"
                          :alt="'housing image ' + index + 1 || ''"
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
                      <h2 class="text-h5 font-weight-bold text-center text-md-left d-flex align-center ga-2">
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
                          <span class="font-weight-bold text-no-wrap">{{ housingTypeTitle }}:</span>
                          {{ housing.housingType }}
                        </div>
                        <div v-if="housing.housingMood">
                          <span class="font-weight-bold text-no-wrap">{{ housingMoodTitle }}:</span>
                          <EnrichedText
                            :value="housing.housingMood"
                          />
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
import { mdiArrowLeft, mdiArrowRight } from '@mdi/js'
import { useScroll, useElementSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'

const { housingBlock } = defineProps({
  color: {
    type: String,
    default: 'primary',
  },
  housingBlock: {
    type: Array,
    default: () => [],
  },
  housingTitle: {
    type: String,
    required: true,
  },
  housingTypeTitle: {
    type: [String, Array],
    required: true,
  },
  housingMoodTitle: {
    type: [String, Array],
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
  return housingBlock?.length || 0
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
@media (max-width: 600px) {
  .housing-text{
    font-size: 14px;
    line-height: 20px;
  }
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
::-webkit-scrollbar {
  width: 5px;

}
/* Track */
::-webkit-scrollbar-track {
  border: 7px solid white;
  background: #C5C7C9;
  height:10px;
  border-radius: 9px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background-color: #0808b6;
  border: 6px solid lightgrey;
  border-radius: 9px;
  background-clip: content-box;
  height:10px;
  width:10px;
  }
.max-height-container{
  max-height: 230px;
  overflow-y: auto;
}
</style>
