<template>
  <v-container>
    <v-card
      max-width="400"
    >
      <v-img
        :src="img(voyageImg, { format: 'webp', quality: 70, height: 300 })"
      >
        <v-container class="h-100 d-flex align-center">
          <v-row>
            <v-col cols="12">
              <h2 class="text-center text-white text-h6 font-weight-black text-shadow">
                {{ voyageTitle }}
              </h2>
            </v-col>
          </v-row>
        </v-container>
      </v-img>
      <v-card-item>
        <v-card-title class="font-weight-black">
          <slot name="catch-phrase" />
        </v-card-title>
        <v-list class="py-0">
          <slot name="payment-items" />
        </v-list>
      </v-card-item>
      <v-card-actions class="d-flex flex-column ga-4 mb-4">
        <v-btn-secondary class="on-hover">
          <slot name="text-btn-1" />
        </v-btn-secondary>

        <v-btn-secondary class="on-hover">
          <template #prepend>
            <v-icon>{{ mdiCalendar }}</v-icon>
          </template>
          <!-- <NuxtLink :to="`/calendly/${route.params?.voyageSlug}`"> Prendre RDV avec un conseiller </NuxtLink> -->
          <slot name="text-btn-2" />
        </v-btn-secondary>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { mdiCalendar } from '@mdi/js'
import { useImage } from '#imports'

const route = useRoute()
const img = useImage()

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})
const voyageTitle = computed(() => {
  return page.value.body.value[0][2][2][2]
})

const voyageImg = computed(() => {
  return page.value.body.value[0][1]['image-src']
})
</script>
