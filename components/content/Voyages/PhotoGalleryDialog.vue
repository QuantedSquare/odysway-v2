<template>
  <v-dialog
    v-model="dialog"
    transition="dialog-top-transition"
    fullscreen
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        variant="outlined"
        size="large"
        :append-icon="mdiPlay"
        color="text-shadow bg-blur"
      >
        <span class="text-caption text-uppercase text-md-button text-shadow"><slot name="gallery-btn" /></span>
      </v-btn>
    </template>
    <v-sheet>
      <v-container fluid>
        <v-row justify="end">
          <v-col cols="auto">
            <v-btn
              variant="outlined"
              :prepend-icon="mdiClose"
              color="grey-darken-3"
              @click="dialog = false"
            >
              Fermer
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <slot name="photo-col" />
        </v-row>
      </v-container>
    </v-sheet>
  </v-dialog>
</template>

<script setup>
import { mdiPlay, mdiClose } from '@mdi/js'

const dialog = ref(false)
</script>

<style scoped>
.bg-blur{
  background-color: rgba(255, 255, 255, 0.214)!important;
  backdrop-filter: blur(8px);
  box-shadow: 2px 2px 5px  rgba(255, 255, 255, 0.3);
}
</style>
