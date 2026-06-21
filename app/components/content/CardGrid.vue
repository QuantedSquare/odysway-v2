<template>
  <v-container
    fluid
    class="pa-0 mx-0 "
  >
    <v-container
      v-if="width > 960"
      fluid
    >
      <v-row>
        <v-col
          cols="12"
          class="text-center mt-md-4 mb-md-12"
        >
          <p
            v-if="eyebrow"
            class="cardgrid-eyebrow"
          >
            {{ eyebrow }}
          </p>
          <div class="text-h2 font-weight-bold">
            <slot name="title" />
          </div>
        </v-col>
        <ImageTitleColCard
          v-for="category in categories"
          :key="category._id"
          :title="category.title"
          :subtitle="category.discoveryTitle"
          :image="category.image"
          :link="'/thematiques/' + category.slug.current"
          :promotion-name="promotionName"
        />
      </v-row>
    </v-container>
    <HorizontalCarousel
      v-else
      :center-title="true"
      :eyebrow="eyebrow"
      slider-name="card-grid"
    >
      <template #title>
        <slot name="title" />
      </template>
      <template #carousel-item>
        <CategColCard
          v-for="category in categories"
          v-show="category.showOnHome"
          :key="category._id"
          :slug="category.slug.current"
          :image="category.image"
          :title="category.title"
          :description="category.discoveryTitle"
          type="thematiques"
          :promotion-name="promotionName"
        />
      </template>
    </HorizontalCarousel>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  promotionName: {
    type: String,
    default: null,
  },
  eyebrow: {
    type: String,
    default: '',
  },
})

const { width } = useDisplay()
const { trackViewPromotion } = useGtmTracking()

// Track view_promotion when component is mounted
onMounted(() => {
  if (props.promotionName) {
    trackViewPromotion(props.promotionName)
  }
})
</script>

<style scoped>
.cardgrid-eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}
</style>
