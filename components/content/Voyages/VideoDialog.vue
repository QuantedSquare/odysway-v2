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
      class="d-flex flex-column pa-1"
    >
      <v-btn
        variant="outlined"
        :prepend-icon="mdiClose"
        color="grey-darken-3"
        class="align-self-end bg-white"
        max-width="150px"
        @click="dialog = false"
      >
        Fermer
      </v-btn>
      <v-window show-arrows>
        <template #prev="{ props }">
          <v-btn
            density="compact"
            icon
            color="grey-lighten-4 opacity-60"
            @click="props.onClick"
          >
            <v-icon
              :icon="mdiChevronLeft"
              color="grey-darken-3"
            />
          </v-btn>
        </template>
        <template #next="{ props }">
          <v-btn
            density="compact"
            icon
            color="grey-lighten-4 opacity-60"
            @click="props.onClick"
          >
            <v-icon
              :icon="mdiChevronRight"
              color="grey-darken-3"
            />
          </v-btn>
        </template>
        <v-window-item
          v-for="video in videoSrc"
          :key="video"
        >
          <iframe
            class="align-self-center"
            width="100%"
            :height="$vuetify.display.smAndDown ? '400': '600'"
            :src="video"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          />
        </v-window-item>
      </v-window>
    </v-container>
  </v-dialog>
</template>

<script setup>
import { mdiPlay, mdiClose, mdiChevronLeft, mdiChevronRight } from '@mdi/js'

defineProps({
  videoSrc: {
    type: Array,
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
