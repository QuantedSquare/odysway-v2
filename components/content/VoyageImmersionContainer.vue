<template>
  <div class="bg-odysway-1 py-8 mt-4">
    <v-container>
      <v-row
        align="center"
        justify="space-between"
      >
        <v-col
          cols="12"
          md="4"
          class="d-flex justify-center"
        >
          <FlipCard
            :front-image="img(imageSrc, { format: 'webp', quality: 100 })"
            :back-image="img(backImg, { format: 'webp', quality: 100 })"
            :description="`Le vrai voyage ne consiste pas à chercher de nouveaux paysages, mais à avoir de nouveaux yeux.`"
            title="`Le voyage en immersion, le partage au cœur du voyage 🌍"
          />
        </v-col>
        <v-col
          class="text-dark"
          cols="12"
          md="7"
        >
          <h2 class="text-h5 text-h4 font-weight-black">
            <slot name="title" />
          </h2>
          <div class="d-flex flex-column align-center">
            <div class="text-wrapper">
              <div :class="['text-content', { expanded: isExpanded }]">
                <slot name="text" />
              </div>
              <div :class="['gradient-overlay', { hidden: isExpanded }]" />
            </div>
            <BouncingBtn v-model="isExpanded" />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    required: true,
    // Why default if required ?
    // default: '/images/IMG-20240320-WA0124.jpg',
  },
  backImg: {
    type: String,
    required: true,
    // default: '/images/Capture d’écran 2025-01-08 à 09.41.11',
  },
})
const isExpanded = ref(false)

const img = useImage()
</script>

<style scoped>
.text-wrapper {
  position: relative;
  width: 100%;
}

.text-content {
  max-height: 12rem; /* Adjust this value based on your needs */
  overflow: hidden;
  transition: max-height 0.5s ease;
}

.text-content.expanded {
  max-height: 2000px; /* Set this to a value larger than your content */
}

.gradient-overlay {
  position: absolute;
  bottom: 0;
  left: -10px;
  right: 0;
  height: 70%;
  mask: linear-gradient(transparent, rgba(0, 0, 0, 0.885), black);
  backdrop-filter: blur(2px);
  background: linear-gradient(transparent, #edeff8);
  opacity: 1;
  pointer-events: none;
  transition: opacity 0.5s ease;
}

.gradient-overlay.hidden {
  opacity: 0;
}
</style>
