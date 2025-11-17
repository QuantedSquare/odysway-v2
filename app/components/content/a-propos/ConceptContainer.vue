<template>
  <div>
    <v-container>
      <v-row
        justify="center"
      >
        <v-col
          cols="12"
          class=""
        >
          <slot
            name="text"
          />
        </v-col>
        <v-col class="d-flex align-center">
          <v-avatar
            size="x-large"
            class="mr-4"
          >
            <SanityImage
              :asset-id="imageSrc.asset._ref"
              auto="format"
            >
              <template #default="{ src }">
                <v-img :src="img(src, { format: 'webp', quality: 70, width: 640 })" />
              </template>
            </SanityImage>
          </v-avatar>
          <slot name="founder" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: Object,
    required: true,
  },
})

const img = useImage()
</script>
