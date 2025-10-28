<template>
  <div
    class="rounded-xl"
    :class="`bg-${backgroundColor}`"
  >
    <v-container
      fluid
      class="pa-0"
    >
      <v-row
        class="ma-0 flex-column-reverse flex-md-row"
      >
        <v-col
          cols="12"
          md="5"
          class="d-flex flex-column justify-center ga-6 ga-md-8 pl-md-8"
        >
          <h1
            class="text-center text-md-left text-h3 text-md-h1 font-weight-bold py-4 py-md-0"
            :class="`text-${titleColor}`"
          >
            <slot name="title" />
          </h1>
        </v-col>
        <v-spacer />
        <v-col
          cols="12"
          md="6"
          class="pa-0"
        >
          <SanityImage
            v-if="displayedImg?.asset?._ref"
            :asset-id="displayedImg.asset._ref"
            auto="format"
          >
            <template #default="{ src }">
              <v-img
                :src="img(src, { format: 'webp', quality: 70, height: 900, width: 1536 })"
                :lazy-src="img(src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
                cover
                alt="Image principale de la page"
                :class="smAndDown ? 'rounded-t-lg' : 'rounded-e-lg'"
                max-height="682px"
                width="100%"
              />
            </template>
          </SanityImage>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

defineProps({
  backgroundColor: { type: String, default: 'primary' },
  titleColor: { type: String, default: 'white' },
  displayedImg: { type: Object, default: () => ({}) },
})

const { smAndDown } = useDisplay()
const img = useImage()
</script>
