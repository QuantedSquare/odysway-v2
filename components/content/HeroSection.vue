<template>
  <v-parallax
    :src="img(imageSrc, { format: 'webp', quality: 70, height })"
    height="100vh"
    cover
  >
    <span class="absolute-position shadow px-6">
      <slot
        name="title"
      />
      <div class="d-flex flex-column ">
        <v-text-field
          v-model="search"
          label="Saisir votre prochaine destination"
          hide-details
          class="mt-5 inner-textfield"
          :append-inner-icon="mdiMagnify"
        />
        <div class="d-none d-md-flex justify-center ga-6 mt-5">
          <v-btn variant="outlined">
            Laponie
          </v-btn>
          <v-btn variant="outlined">
            Japon
          </v-btn>
          <v-btn variant="outlined">
            France
          </v-btn>
          <v-btn variant="outlined">
            Laos
          </v-btn>
        </div>
      </div>
    </span>
  </v-parallax>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { mdiMagnify } from '@mdi/js'
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
})
const img = useImage()
const search = ref('')
const { height } = useDisplay()
</script>

<style scoped>
.absolute-position {
  font-weight: 700;
  position: absolute;
  bottom: 20%;
  left: 10%;
  font-size: 5rem;
  color: white;
}

.shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.inner-textfield:deep(.v-field__overlay) {
  background-color: rgba(255, 255, 255, 0.112)!important;
  backdrop-filter: blur(7px);
}

@media screen and (max-width: 600px) {
  .absolute-position {
    font-size: 3rem;

    width: 100%;
  }
}

@media screen and (max-width: 400px) {
  .absolute-position {
    font-size: 2rem;
    left: 2%;
  }
}
</style>
