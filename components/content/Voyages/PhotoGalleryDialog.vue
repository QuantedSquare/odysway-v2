<template>
  <v-dialog
    v-if="photosList.length > 0"
    v-model="dialog"
    transition="dialog-top-transition"
    fullscreen
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        :height="lgAndUp ? 58 : 40"
        :width="lgAndUp ? 172: ''"
        v-bind="activatorProps"
        rounded="pill"
        color="white"
        class="btn-shadow"
      >
        <v-icon
          :icon="mdiCameraOutline"
          color="primary"
          :size="lgAndUp ? 22 : 19"
        />
        <span class="d-none d-sm-block text-caption text-sm-subtitle-2 text-primary font-weight-bold ml-2"> Voir les {{ photosList.length }} photos</span>
        <span class="d-block d-sm-none text-caption text-md-subtitle-2 text-primary font-weight-bold ml-2">Photos</span>
      </v-btn>
    </template>
    <v-sheet>
      <v-container fluid>
        <v-row justify="end">
          <v-col cols="auto">
            <v-btn
              variant="outlined"
              :prepend-icon="mdiClose"
              color="primary"
              @click="dialog = false"
            >
              Fermer
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <PhotoCol
            v-for="(photo, index) in photosList"
            :key="photo.src + index"
            :image-src="photo.src"
            :col-width="getColWidth(index)"
            :alt="photo.alt"
          />
        </v-row>
      </v-container>
    </v-sheet>
  </v-dialog>
</template>

<script setup>
import { mdiClose, mdiCameraOutline } from '@mdi/js'
import { useDisplay } from 'vuetify'

defineProps({
  photosList: {
    type: Array,
    required: true,
  },
})
const { lgAndUp } = useDisplay()
const dialog = ref(false)

const getColWidth = (index) => {
  const pattern = [7, 5, 4, 8, 5, 7, 7, 5, 4, 8, 5, 7, 7, 5, 4, 8, 5, 7, 7, 5, 4]
  return pattern[index % pattern.length].toString()
}
</script>
