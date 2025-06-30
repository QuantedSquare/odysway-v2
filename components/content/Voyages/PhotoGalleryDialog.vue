<template>
  <v-dialog
    v-if="photosList.length > 0"
    v-model="dialog"

    transition="dialog-top-transition"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        :height="mdAndUp ? 58 : 40"
        :width="mdAndUp ? 172: ''"
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

    <v-container fluid>
      <v-row justify="end">
        <v-col cols="auto">
          <v-btn

            :prepend-icon="mdiClose"
            color="primary"
            @click="dialog = false"
          >
            Fermer
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <!-- <PhotoCol
            v-for="(photo, index) in photosList"
            :key="photo.src + index"
            :image-src="photo.src"
            :col-width="getColWidth(index)"
            :alt="photo.alt"
          /> -->
        <v-col
          cols="12"
          class="px-0 "
        >
          <v-carousel
            class="custom-btn bg-odysway-2 rounded-lg "
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
                class="rounded-md-lg"
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
defineProps({
  photosList: {
    type: Array,
    required: true,
  },
})
const { mdAndUp } = useDisplay()
const dialog = ref(false)
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
}
</style>
