<template>
  <v-card
    elevation="0"
  >
    <v-img
      :src="img(voyageImg, { format: 'webp', quality: 70, height: 400, width: 640 })"
      max-height="400"
      cover
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
      <v-card-title class="text-center text-grey-darken-3 no-white-space font-weight-black ">
        <slot name="catch-phrase" />
      </v-card-title>
      <v-list slim>
        <slot name="payment-items" />
      </v-list>
    </v-card-item>
    <v-card-actions class="mb-4">
      <v-container>
        <v-row
          justify-md="center"
          class="text-center"
        >
          <v-col
            cols="12"
            lg="10"
          >
            <v-btn-secondary block>
              <slot name="text-btn-1" />
            </v-btn-secondary>
          </v-col>
          <v-col
            cols="12"
            lg="8"
          >
            <NuxtLink
              width="100%"
              class="text-primary text-decoration-underline text-break"
              to="#"
            >

              <v-icon
                size="x-large"
                class="mr-2"
              >
                {{ mdiCalendarMonthOutline }}
              </v-icon>

              <!-- <NuxtLink :to="`/calendly/${route.params?.voyageSlug}`"> Prendre RDV avec un conseiller </NuxtLink> -->
              <span>
                <slot
                  name="text-btn-2"
                  mdc-unwrap="p"
                />
              </span>
            </NuxtLink>
          </v-col>
        </v-row>
      </v-container>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { mdiCalendarMonthOutline } from '@mdi/js'
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
