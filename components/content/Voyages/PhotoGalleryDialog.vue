<template>
  <v-dialog
    v-model="dialog"
    transition="dialog-top-transition"
    fullscreen
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        height="58px"
        width="172px"
        v-bind="activatorProps"
        rounded="pill"
        color="white"
        class="btn-shadow"
      >
        <v-icon
          :icon="mdiCameraOutline"
          color="primary"
          size="22"
        />
        <span class="text-subtitle-2 text-primary font-weight-bold ml-2"> Voir les photos</span>
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
          <slot name="photo-col" />
        </v-row>
      </v-container>
    </v-sheet>
  </v-dialog>
</template>

<script setup>
import { mdiClose, mdiCameraOutline } from '@mdi/js'

const dialog = ref(false)
</script>
