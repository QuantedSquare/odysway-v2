<template>
  <v-img
    :src="img(imageSrc, { format: 'webp', quality: 70, height: 900 })"
    :lazy-src="img(imageSrc, { format: 'webp', quality: 10, height: 900 })"
    height="100vh"
    cover
  >
    <!-- image attributes ⬆️
    size="(max-width: 600) 480px, 1500px"
    :srcset="`${img(imageSrc, { format: 'webp', quality: 70, width: 600 })} 480w, ${img(imageSrc, { format: 'webp', quality: 70, width: 900 })} 1500w`" -->
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
            <!-- <v-img
              contain
              width="100%"
              class="img-shadow"
              lazy-src="/images/Laponie-(1).webp"
              :src="img('/logos/logo_blanc.png', { format: 'webp', quality: 70 })"
            /> -->
            <h1 class="text-h3 text-md-h1">
              <slot name="title" />
              <!-- <span class="responsive-title text-no-wrap">
                <slot name="title" />
              </span>
              <span class="responsive-subtitle text-no-wrap">
                <slot name="title-2" />
              </span> -->
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
// const { height } = useDisplay()
</script>

<style scoped>
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
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
