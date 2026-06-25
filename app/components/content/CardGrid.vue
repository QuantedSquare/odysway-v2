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
          class="my-4"
        >
          <p
            v-if="eyebrow"
            class="cardgrid-eyebrow"
          >
            {{ eyebrow }}
          </p>
          <span class="carousel-titlewrap text-h2">
            <slot name="title" />
          </span>
        </v-col>
        <ImageTitleColCard
          v-for="category in categories"
          :key="category._id"
          :title="category.title"
          :subtitle="category.discoveryTitle"
          :image="category.image"
          :icon="category.icon"
          :link="'/thematiques/' + category.slug.current"
          :promotion-name="promotionName"
        />
      </v-row>
    </v-container>
    <HorizontalCarousel
      v-else
      :eyebrow="eyebrow"
      slider-name="card-grid"
    >
      <template #title>
      <span class="carousel-titlewrap text-h2">
        <slot name="title" />
      </span>
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
          :icon="category.icon"
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
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}
.carousel-titlewrap {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}
</style>
