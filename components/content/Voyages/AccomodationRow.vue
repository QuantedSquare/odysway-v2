<template>
  <v-container>
    <v-row>
      <v-col :class="$vuetify.display.mdAndUp ? 'd-block' : 'd-none'">
        <v-card-text class="text-subtitle-1 text-grey-darken-3 pl-0 pt-0">
          <slot
            name="text"
            mdc-unwrap="p"
          />
        </v-card-text>
      </v-col>
      <v-col>
        <v-card>
          <v-carousel
            ref="accomodation-carousel"
            height="300"
            :show-arrows="nbCarouselItems > 1 ? 'hover' : false"
            :cycle="nbCarouselItems > 1 ? true : false"
            :hide-delimiters="nbCarouselItems > 1 ? false : true"
          >
            <slot name="images" />
          </v-carousel>
          <v-card-actions :class="$vuetify.display.smAndDown ? 'd-block' : 'd-none'">
            <v-btn
              variant="text"
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
              <v-card-text class="text-subtitle-1 text-grey-darken-3">
                <slot
                  name="text"
                  mdc-unwrap="p"
                />
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const accomodationCarousel = useTemplateRef('accomodation-carousel')
const nbCarouselItems = ref(0)

onMounted(() => {
  nbCarouselItems.value = accomodationCarousel.value?.$el.children[0]?.children?.length - 1
})

const show = ref(false)
</script>
