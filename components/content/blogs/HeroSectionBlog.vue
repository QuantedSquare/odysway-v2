<template>
  <v-img
    :src="img(imageSrc, { format: 'webp', quality: 70, height: 900, width: 1536 })"
    :lazy-src="img(imageSrc, { format: 'webp', quality: 10, height: 900, width: 1536 })"
    height="100vh"
    cover
    class="position-relative"
  >
    <v-btn-primary
      to="/blog"
      color="white"
      class="btn-position hidden-sm-and-down pl-md-0"
    >
      <template #prepend>
        <v-icon>
          {{ mdiChevronLeft }}
        </v-icon>
      </template>

      <span> retour aux blogs</span>
    </v-btn-primary>
    <v-btn
      to="/blog"
      variant="outlined"
      density="compact"
      color="white"
      :icon="mdiChevronLeft"
      class="btn-position hidden-md-and-up"
    />
    <div class="h-100 d-flex align-end">
      <v-container class="text-white text-shadow">
        <v-row justify="center">
          <v-col
            cols="12"
            md="10"
            xl="8"
            class="d-flex flex-column justify-center"
          >
            <p class="text-body-1">
              <slot
                name="publication-date"
                mdc-unwrap="p"
              />
            </p>
            <h1 class="text-h4 text-md-h1 font-weight-bold ">
              <slot
                name="title"
                mdc-unwrap="p"
              />
            </h1>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-img>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        md="10"
        xl="8"
      >
        <slot name="introduction" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiChevronLeft } from '@mdi/js'
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
})
const img = useImage()
</script>

<style scoped>
.btn-position{
  position: absolute;
  top: 10%;
  left: 32px;
}
</style>
