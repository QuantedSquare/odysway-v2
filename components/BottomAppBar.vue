<template>
  <v-app-bar
    location="bottom"
    class="d-md-none py-2 py-sm-0"
  >
    <v-container>
      <v-row
        no-gutters
        class="ga-2"
      >
        <v-col
          cols="12"
          sm="auto"
          class="d-flex align-center"
        >
          <slot name="starting-price" />
        </v-col>
        <v-col class="d-flex justify-start justify-sm-end">
          <!-- scroll to prices/dates or different page ? -->
          <v-btn-secondary
            rounded="sm"
            class="on-hover mr-4 text-caption text-uppercase"
          >
            <slot name="text-btn-1" />
          </v-btn-secondary>

          <v-btn-secondary
            rounded="sm"
            class="on-hover text-caption text-uppercase"
          >
            <template #prepend>
              <v-icon>{{ mdiCalendar }}</v-icon>
            </template>
            <!-- <NuxtLink :to="`/calendly/${route.params?.voyageSlug}`"> Prendre RDV avec un conseiller </NuxtLink> -->
            <slot name="text-btn-2" />
          </v-btn-secondary>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { mdiCalendar } from '@mdi/js'
</script>
