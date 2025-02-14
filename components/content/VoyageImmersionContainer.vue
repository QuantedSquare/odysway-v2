<template>
  <div class="bg-sectionBg py-8 mt-4">
    <v-container class="">
      <v-row
        align="center"
        justify="space-between"
      >
        <v-col
          cols="12"
          md="4"
          class=" d-flex justify-center"
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
            <div
              v-if="!isExpanded"
              class="line-clamp-2"
            >
              <slot name="text" />
            </div>

            <v-expand-transition>
              <div v-if="isExpanded">
                <slot name="text" />
              </div>
            </v-expand-transition>

            <v-btn
              variant="text"
              class="mt-2 btn-boucing"
              :icon="isExpanded ? mdiChevronDoubleUp : mdiChevronDoubleDown"
              @click="isExpanded = !isExpanded"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { mdiChevronDoubleDown, mdiChevronDoubleUp } from '@mdi/js'
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
.text-content {
  transition: all 0.3s ease;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
}
.btn-boucing{
  animation: bounce 3s infinite;
}
@keyframes bounce {
  0%, 50%, 100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-10px);
  }
  75% {
    transform: translateY(-10px);
  }
}
</style>
