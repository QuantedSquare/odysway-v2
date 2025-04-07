<template>
  <v-img
    :src="img(imageSrc, { format: 'webp', quality: 70, height: 900, width: 1536 })"
    :lazy-src="img(imageSrc, { format: 'webp', quality: 10, height: 900, width: 1536 })"
    size="(max-width: 600) 480px, 1500px"
    :srcset="`${img(imageSrc, { format: 'webp', quality: 70, width: 640 })} 480w, ${img(imageSrc, { format: 'webp', quality: 70, width: 1024 })} 1500w`"
    height="100vh"
    cover
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
            md="6"
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
    type: String,
    default: '/images/Laponie-(1).webp',
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
