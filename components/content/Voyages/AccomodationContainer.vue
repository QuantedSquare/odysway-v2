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
            :cycle="nbCarouselItems > 1 ? true : false"
            :hide-delimiters="nbCarouselItems > 1 ? false : true"
          >
            <slot name="images" />
          </v-carousel>
          <v-card-actions
            class="d-sm-none d-block"
          >
            <v-btn
              variant="text"
              :append-icon="mdiChevronDown"
              color="primary"
              class="my-4"
              @click="show = !show"
            >
              <slot name="know-more" />
            </v-btn>
          </v-card-actions>
          <v-expand-transition>
            <div
              v-show="show && $vuetify.display.smAndDown"
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
import { mdiChevronDown } from '@mdi/js'

const accomodationCarousel = useTemplateRef('accomodation-carousel')
const nbCarouselItems = ref(0)

const show = ref(false)

onMounted(() => {
  nbCarouselItems.value = accomodationCarousel.value?.$el.children[0]?.children?.length - 1
})
</script>

<style scoped>
.v-window {
  border-radius: 8px !important;
}
</style>
