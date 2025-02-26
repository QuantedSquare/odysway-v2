<template>
  <div>
    <v-dialog
      v-model="dialog"
      transition="dialog-top-transition"
    >
      <template #activator="{ props: activatorProps }">
        <v-btn
          v-bind="activatorProps"
          variant="outlined"
          size="large"
          :append-icon="mdiPlay"
          color="text-shadow bg-blur"
        >
          <span class="text-caption text-uppercase text-md-button text-shadow"><slot name="video-btn" /></span>
        </v-btn>
      </template>
      <v-container>
        <v-row justify="center">
          <v-col
            cols="12"
            md="8"
            class="d-flex flex-column ga-4"
          >
            <v-btn
              variant="outlined"
              :prepend-icon="mdiClose"
              color="white"
              class="align-self-end"
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
  </div>
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
