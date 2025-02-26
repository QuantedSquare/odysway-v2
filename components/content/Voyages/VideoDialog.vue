<template>
  <v-dialog
    v-model="dialog"
    transition="dialog-bottom-transition"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        variant="outlined"
        size="large"
        block
        :append-icon="mdiPlay"
        color="text-shadow bg-blur"
      >
        <span class="text-caption text-uppercase text-md-button text-shadow"><slot name="video-btn" /></span>
      </v-btn>
    </template>
    <v-container
      class="pa-1"
      fluid
    >
      <v-row justify="center">
        <v-col
          cols="12"
          md="6"
          class="d-flex flex-column ga-4 pa-1"
        >
          <v-btn
            variant="outlined"
            :prepend-icon="mdiClose"
            color="grey-darken-3"
            class="align-self-end bg-white"
            @click="dialog = false"
          >
            Fermer
          </v-btn>
          <iframe
            class="align-self-center"
            width="100%"
            height="300"
            :src="props.videoSrc"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          />
        </v-col>
      </v-row>
    </v-container>
  </v-dialog>
</template>

<script setup>
import { mdiPlay, mdiClose } from '@mdi/js'

const props = defineProps({
  videoSrc: {
    type: String,
  },
})

const dialog = ref(false)
</script>

<style scoped>
.bg-blur{
  background-color: rgba(255, 255, 255, 0.214)!important;
  backdrop-filter: blur(8px);
  box-shadow: 2px 2px 5px  rgba(255, 255, 255, 0.3);
}
</style>
