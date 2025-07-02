<template>
  <v-dialog
    v-if="photosList.length > 0"
    v-model="dialog"
    transition="dialog-top-transition"
    class="bg-primary"
    tabindex="0"
    @keydown="handleKeydown"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        :height="mdAndUp ? 58 : 40"
        v-bind="activatorProps"
        rounded="pill"
        color="white"
        class="btn-shadow"
      >
        <v-img
          :src="img('/icons/Camera.svg', { format: 'webp', quality: 70, width: 640 })"
          alt="Camera icon"
          :width="mdAndUp ? 22 : 20"
          :height="mdAndUp ? 22 : 20"
        />

        <span class="d-none d-sm-block text-caption text-sm-subtitle-2 text-primary font-weight-bold ml-2"> Voir les {{ photosList.length }} photos</span>
        <span class="d-block d-sm-none text-caption text-md-subtitle-2 text-primary font-weight-bold ml-2">Photos</span>
      </v-btn>
    </template>

    <div class="d-flex justify-end py-2">
      <v-btn
        :prepend-icon="mdiClose"
        color="primary"
        @click="dialog = false"
      >
        Fermer
      </v-btn>
    </div>

    <v-container fluid>
      <v-row>
        <v-col
          cols="12"
          class="px-0 py-0 py-md-3"
        >
          <v-carousel
            class="custom-btn bg-odysway-2"
            hide-delimiter-background
            :hide-delimiters="smAndDown"
            :model-value="currentSlideIndex"
            @update:model-value="handleCarouselUpdate"
          >
            <v-carousel-item
              v-for="(photo, index) in photosList"
              :key="photo.src + index"
            >
              <v-img
                :src="img(photo.src, { format: 'webp', quality: 70, height: 900, width: 1536 })"
                :lazy-src="img(photo.src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
                :alt="photo.alt || `Photo de galerie du voyage ${index}`"
                width="100%"
              />
            </v-carousel-item>
          </v-carousel>
        </v-col>
      </v-row>
    </v-container>
  </v-dialog>
</template>

<script setup>
import { mdiClose } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const img = useImage()
const { photosList } = defineProps({
  photosList: {
    type: Array,
    required: true,
  },
})
const { mdAndUp, smAndDown } = useDisplay()
const dialog = ref(false)
const currentSlideIndex = ref(0)

const handleCarouselUpdate = (newIndex) => {
  currentSlideIndex.value = newIndex
}

const handleKeydown = (event) => {
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      if (currentSlideIndex.value > 0) {
        currentSlideIndex.value--
      }
      else {
        currentSlideIndex.value = photosList.length - 1
      }
      break
    case 'ArrowRight':
      event.preventDefault()
      if (currentSlideIndex.value < photosList.length - 1) {
        currentSlideIndex.value++
      }
      else {
        currentSlideIndex.value = 0
      }
      break
    case 'Escape':
      event.preventDefault()
      dialog.value = false
      break
  }
}

// Focus the dialog when it opens to enable keyboard navigation
watch(dialog, (newValue) => {
  if (newValue) {
    nextTick(() => {
      const dialogElement = document.querySelector('.v-dialog--active')
      if (dialogElement) {
        dialogElement.focus()
      }
    })
  }
})
</script>

<style scoped>
.custom-btn:deep(button){
  background-color: transparent!important;
  color: rgb(var(--v-theme-primary-light-1))!important;
}
.custom-btn:deep(svg){
  border-radius: 100%;
  background-color: rgba(255, 255, 255, 0.3);
}
.custom-btn:deep(.v-responsive__content){
display: flex;
align-items: center;
background-color: rgba(var(--v-theme-primary));
}
</style>
