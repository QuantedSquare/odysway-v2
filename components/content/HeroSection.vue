<template>
  <v-parallax
    :src="img(imageSrc, { format: 'webp', quality: 70, height: 900 })"
    height="100vh"
    cover
  >
    <div class="h-100  d-flex align-center">
      <v-container class="text-white text-h4 text-md-h2 font-weight-bold text-shadow  text-center">
        <v-row
          justify="center"
          align="center"
        >
          <v-col
            cols="10"
            md="6"
          >
            <v-img
              contain
              width="100%"
              class="img-shadow"
              :src="img('/logos/logo_blanc.png', { format: 'webp', quality: 70 })"
            />
            <h1>
              <span class="text-h3 text-md-h2">
                <slot
                  name="title"
                />
              </span>
              <span class="text-h5 text-md-h4">
                <slot
                  name="title-2"
                />
              </span>
            </h1>
          </v-col>
        </v-row>
        <v-row
          justify="center"
          align="center"
        >
          <v-col
            cols="10"
            md="6"
          >
            <slot
              name="component-slot"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-parallax>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
})
const img = useImage()
// const { height } = useDisplay()
</script>

<style scoped>
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
.img-shadow{
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}
</style>
