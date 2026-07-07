<template>
  <v-container
    fluid
    class="pa-0 mx-0"
  >
    <v-container fluid class="py-0">
      <!-- Responsive grid at every breakpoint (prototype: 4 cols desktop,
           2 cols mobile). ImageTitleColCard sets cols=6 / sm=4 / md=3, so
           mobile naturally falls into a 2-per-row grid instead of a carousel. -->
      <v-row>
        <v-col
          cols="12"
          class="mb-md-4"
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
  </v-container>
</template>

<script setup>
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
