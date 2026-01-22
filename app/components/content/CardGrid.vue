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
          class="text-center text-h2 font-weight-bold mt-md-4 mb-md-12"
        >
          <slot name="title" />
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
