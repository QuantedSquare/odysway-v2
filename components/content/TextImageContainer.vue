<template>
  <v-container :fluid="width <= 1600">
    <v-row
      :class="imageDesktopRight ? '' : 'flex-row-reverse'"
    >
      <v-col
        cols="12"
        md="6"
      >
        <v-row>
          <v-col
            cols="12"
            class="text-h2"
          >
            <slot name="title" />
          </v-col>
        </v-row>
        <v-row>
          <slot name="content-cols" />
        </v-row>
        <v-row>
          <v-col
            v-if="displayCtaButton"
            cols="12"
            md="auto"
            class="mt-8 mt-md-16 text-center"
          >
            <slot name="cta-button" />
          </v-col>
        </v-row>
      </v-col>
      <v-col
        :class="{
          'd-none': smAndDown && !displayImageMobile,
        }"
        cols="12"
        md="6"
      >
        <v-lazy
          :min-height="550"
          :options="{ threshold: 0.5 }"
          transition="fade-transition"
        >
          <v-img
            :src="img(imageSrc, { format: 'webp', quality: 70, height: 640, width: 640 })"
            :lazy-src="img(imageSrc, { format: 'webp', quality: 10, height: 640, width: 640 })"
            :srcset="`${img(imageSrc, { format: 'webp', quality: 70, width: 640 })} 640w, ${img(imageSrc, { format: 'webp', quality: 70, width: 1024 })} 1024w`"
            sizes="(max-width: 600px) 480px, 1024px"
            alt="Image section voyager autrement"
            loading="lazy"
            height="100%"
            max-height="550"
            cover
            rounded="xl"
          />
        </v-lazy>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '/images/voyages/bali-menjangan-sidemen/KSM0NI92R9OCsioOBCVO.jpg',
  },
  imageDesktopRight: {
    type: Boolean,
    default: true,
  },
  displayImageMobile: {
    type: Boolean,
    default: false,
  },
  displayCtaButton: {
    type: Boolean,
    default: true,
  },
})

const img = useImage()
const { width, smAndDown } = useDisplay()
</script>
