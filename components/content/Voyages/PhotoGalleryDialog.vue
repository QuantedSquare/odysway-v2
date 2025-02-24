<template>
  <div>
    <v-dialog
      v-model="dialog"
      transition="dialog-top-transition"
      fullscreen
    >
      <template #activator="{ props: activatorProps }">
        <v-btn
          text="voir la galerie photos"
          v-bind="activatorProps"
          variant="outlined"
          size="large"
          :append-icon="mdiPlay"
          color="text-shadow bg-blur on-hover"
        >
          <span class="text-caption text-uppercase text-md-button">voir la galerie photos</span>
        </v-btn>
      </template>
      <v-sheet>
        <v-container fluid>
          <v-row>
            <v-spacer />
            <v-col cols="auto">
              <CloseBtn @close="dialog = false" />
            </v-col>
          </v-row>
          <v-row>
            <v-col class="text-caption text-md-h6">
              <h1><slot name="title" /></h1>
            </v-col>
          </v-row>
          <slot name="photo-row" />
        </v-container>
      </v-sheet>
    </v-dialog>
  </div>
</template>

<script setup>
import { mdiClose, mdiPlay } from '@mdi/js'

const dialog = ref(false)
</script>

<style scoped>
.bg-blur{
  background-color: rgba(255, 255, 255, 0.214)!important;
  backdrop-filter: blur(8px);
  box-shadow: 2px 2px 5px  rgba(255, 255, 255, 0.3);
}

.on-hover:hover{
  scale: 1.03;
}
</style>
