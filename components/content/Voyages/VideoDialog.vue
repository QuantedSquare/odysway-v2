<template>
  <v-dialog
    v-model="dialog"
    transition="dialog-bottom-transition"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn

        v-bind="activatorProps"
        rounded="pill"
        color="white"
        class="btn-shadow custom-btn-height"
      >
        <v-icon
          :icon="mdiVideoOutline"
          color="primary"
          class="custom-icon-size"
        />
        <span class="d-none d-sm-block text-subtitle-2 text-primary font-weight-bold ml-2">Voir les vidéos</span>
        <span class="d-block d-sm-none text-caption text-md-subtitle-2 text-primary font-weight-bold ml-2">Vidéos</span>
      </v-btn>
    </template>
    <v-container
      class="d-flex flex-column pa-1 ga-2"
    >
      <v-btn
        :prepend-icon="mdiClose"
        color="primary"
        class="align-self-end"
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
            @click.stop="props.onClick"
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
            @click.stop="props.onClick"
          >
            <v-icon
              :icon="mdiChevronRight"
              color="grey-darken-3"
            />
          </v-btn>
        </template>
        <v-window-item
          v-for="video in videosLink"
          :key="video"
        >
          <iframe
            class="align-self-center rounded-lg custom-video-size"
            width="100%"
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
import { mdiClose, mdiChevronLeft, mdiChevronRight, mdiVideoOutline } from '@mdi/js'

defineProps({
  videosLink: {
    type: Array,
  },
})

const dialog = ref(false)
</script>

<style scoped>
.custom-btn-height{
  height: 58px!important;
}
.custom-icon-size{
  width: 22px;
  height: 22px;
}
.custom-video-size{
  height: 600px;
}
@media screen and (max-width: 960px) {
  .custom-btn-height{
    height: 30px!important;
  }
  .custom-icon-size{
    width: 14px;
    height: 14px;
  }
}
@media screen and (max-width: 600px) {
  .custom-video-size{
    height: 400px;
  }
}
</style>
