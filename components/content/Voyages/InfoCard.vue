<template>
  <v-card
    v-if="status === 'success'"
    elevation="0"
  >
    <v-img
      :src="img(voyageImg, { format: 'webp', quality: 70, height: 400, width: 640 })"
      :lazy-src="img(voyageImg, { format: 'webp', quality: 10, width: 640 })"
      max-height="400"
      cover
    >
      <v-container class="h-100 d-flex align-center">
        <v-row>
          <v-col cols="12">
            <h2 class="text-center text-white text-h6 font-weight-black text-shadow">
              {{ voyageTitle }}
            </h2>
            <div class="d-flex align-center justify-center">
              <ClientOnly>
                <v-rating
                  :model-value="Number(averageNote)"
                  color="orange-lighten-1"
                  density="compact"
                  size="small"
                  half-increments
                  readonly
                />
                <span class="text-white text-shadow">({{ nbNotes }})</span>
              </ClientOnly>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-img>
    <v-card-item>
      <v-card-title class="text-center text-grey-darken-3 no-white-space font-weight-black ">
        <slot name="catch-phrase" />
      </v-card-title>
      <v-list slim>
        <slot name="payment-items" />
      </v-list>
    </v-card-item>
    <v-card-actions>
      <v-row
        justify-md="center"
        class="text-center"
      >
        <v-col
          cols="12"
          lg="10"
        >
          <v-btn-secondary
            block
            @click="goTo('#dates-container', { offset: -200 })"
          >
            <slot name="text-btn-1" />
          </v-btn-secondary>
        </v-col>
        <v-col
          cols="12"
          lg="6"
        >
          <NuxtLink
            width="100%"
            class="text-primary text-break d-flex align-center justify-center ga-3"
            :to="`/calendly?travelTitle=${voyageTitle}`"
          >

            <v-icon
              size="x-large"
            >
              {{ mdiCalendarMonthOutline }}
            </v-icon>
            <span class="text-left">
              <slot
                name="text-btn-2"
              />
            </span>
          </NuxtLink>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
  <v-skeleton-loader
    v-else
    type="card"
  />
</template>

<script setup>
import { mdiCalendarMonthOutline } from '@mdi/js'
import { useGoTo } from 'vuetify'
import { useImage } from '#imports'

const goTo = useGoTo()

defineProps({
  averageNote: {
    type: Number,
  },
  nbNotes: {
    type: Number,
  },
})

const route = useRoute()
const img = useImage()

const { data: page, status } = useAsyncData(route.path, () => {
  return queryCollection('voyages').path(route.path).first()
})
const voyageTitle = computed(() => {
  return page?.value?.title ?? ''
})

const voyageImg = computed(() => {
  return page.value.body.value[0][1]['image-src']
})
</script>
