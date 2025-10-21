<template>
  <v-img
    :src="img(getImageUrl(imageSrc.asset._ref), { format: 'webp', quality: 70, height: 900, width: 1536 })"
    :lazy-src="img(getImageUrl(imageSrc.asset._ref), { format: 'webp', quality: 10, height: 900, width: 1536 })"
    cover
    alt="Hero image"
    height="50vh"
  >
    <div class="h-100 d-flex align-center">
      <v-container class="text-white text-h4 text-md-h2 font-weight-bold text-shadow text-center">
        <v-row
          justify="center"
          align="center"
        >
          <v-col
            cols="12"
            md="auto"
          >
            <h1 class="text-h3 text-md-h1">
              <slot name="title" />
            </h1>
            <slot name="subtitle" />
          </v-col>
        </v-row>
        <v-row
          justify="center"
          align="center"
        >
          <v-col
            cols="12"
          >
            <slot
              name="component-slot-1"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <slot
              name="component-slot-2"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-img>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: Object,

  },
})
const img = useImage()
</script>

<style scoped>
.img-shadow{
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}
.title-container {
  container-type: inline-size;
}
.title-container .responsive-title {
  font-size: 19.2cqw;
  text-align: start;
}
.responsive-subtitle {
  font-size: 10.9cqw;
  text-align: start;
}
</style>
