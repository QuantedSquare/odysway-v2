<template>
  <v-container>
    <v-card variant="text">
      <v-row>
        <v-col class="d-sm-block d-none">
          <v-card-text class="text-subtitle-1 text-grey-darken-3 pt-0 px-0">
            <slot
              name="text"
              mdc-unwrap="p"
            />
          </v-card-text>
        </v-col>
        <v-col>
          <v-carousel
            ref="accomodation-carousel"
            height="300"
            :show-arrows="nbCarouselItems > 1 ? true : false "
            :cycle="nbCarouselItems > 1 ? true : false"
            hide-delimiters
          >
            <template #prev="{ props }">
              <v-btn
                variant="elevated"
                :icon="mdiChevronLeft"
                color="black opacity-40"
                @click="props.onClick"
              />
            </template>
            <template #next="{ props }">
              <v-btn
                variant="elevated"
                :icon="mdiChevronRight"
                color="black opacity-40"
                @click="props.onClick"
              />
            </template>
            <slot name="images" />
          </v-carousel>
          <v-card-actions
            class="d-sm-none d-flex justify-center"
          >
            <BouncingBtn v-model="isExpanded" />
          </v-card-actions>
          <v-expand-transition>
            <div
              v-show="isExpanded && $vuetify.display.smAndDown"
            >
              <v-card-text class="text-subtitle-1 text-grey-darken-3 px-0">
                <slot
                  name="text"
                  mdc-unwrap="p"
                />
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import BouncingBtn from '../BouncingBtn.vue'

const accomodationCarousel = useTemplateRef('accomodation-carousel')
const nbCarouselItems = ref(0)

const isExpanded = ref(false)

onMounted(() => {
  nbCarouselItems.value = accomodationCarousel.value?.$el.children[0]?.children?.length - 1
})
</script>

<style scoped>
.v-window {
  border-radius: 8px !important;
}
</style>
