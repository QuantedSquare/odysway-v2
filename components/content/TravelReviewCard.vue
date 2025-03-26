<template>
  <v-card
    v-if="review"
    class=" card-width rounded-xl d-flex flex-column product-card"
    :class="{ 'card-unfocused': !isActive }"
    :style="{
      transform: `scale(${isActive ? 1 : 0.95})`,
      opacity: isActive ? 1 : 0.9,
    }"

    elevation="2"
  >
    <v-img
      max-height="250"
      height="250"
      width="100%"
      class="hover-scale"
      :src="review.voyagePhoto"
      cover
    />

    <v-card-title>
      <h3 class="text-body-1 text-wrap">
        {{ review.voyageTitle }}
      </h3>
    </v-card-title>
    <v-card-text class="text-body-2 text-wrap ">
      {{ review.text }}
    </v-card-text>
    <v-spacer />
    <v-card-actions class="text-body-1 text-wrap ">
      <v-avatar>
        <v-img
          :src="formatImage(review.photo)"
          :alt="`Photo de ${review.author}`"
          cover
        />
        <!-- <span v-else>{{ getInitial(item.author) }}</span> -->
      </v-avatar>
      <span>{{ review.author }}</span>
      <v-rating
        :model-value="4.5"
        color="orange-lighten-1"
        density="compact"
        size="small"
        half-increments
        readonly
      />
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const props = defineProps({
  slug: {
    type: String,
    required: true,
    default: 'florence',
  },
})
const { data: review } = useAsyncData('reviews', () => {
  return queryCollection('reviews').where('slug', '=', props.slug).first()
})
const index = ref(0)

const registerComponent = inject('registerComponent')

onMounted(() => {
  index.value = registerComponent({})
  // console.log(index.value)
})
const { currentSection } = inject('current')

const img = useImage()

// const { smAndUp } = useDisplay()

// Helper functions
const formatImage = photo => img(photo, {
  format: 'webp',
  quality: 70,
  height: 100,
  width: 320,
})

const isActive = computed(() => {
  // console.log('currentSection', currentSection.value, 'index', index.value)
  return currentSection.value === index.value
})
</script>

<style scoped>
.card-width{
  width: 350px;
  height:450px;
}

.hover-scale:hover {
  height: 100%;
}
.hover-scale:hover{
  transform: scale(1.02);
  cursor:pointer;
  transition: transform 0.2s ease-in-out;
}
.hover-scale{
  transform:scale(1);
  transition: transform 0.2s ease-in-out;
}

@media screen and (max-width: 1024px) {
  .card-width{
    width: 350px;
  }
}

.product-card {
  border: 3px solid rgba(var(--v-theme-white));
  /* position: relative; */
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center center;
  will-change: transform, opacity;
}

@media screen and (max-width: 600px) {
  .product-card {
  min-width: 250px;
  max-width: 250px;

  /* padding: 3em 1em; */
  /* gap:0.2em; */
  }
  .card-width{
  width: 350px;
  height:500px;
}

}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
}
.card-unfocused {
  transform: scale(0.95);
  border: 2px solid rgba(var(--v-theme-grey-lighten-2));
}
@keyframes cardFocus {
  from {
    transform: scale(0.95);
    opacity: 0.6;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes cardUnfocus {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0.6;
  }
}
</style>
