<template>
  <v-app-bar
    location="bottom"
    class="d-md-none py-2 py-sm-0"
    height="100"
  >
    <v-container>
      <v-row
        no-gutters
        class="ga-1"
      >
        <v-col
          cols="12"
          sm="auto"
          class="d-flex align-center"
        >
          <slot name="starting-price" />
        </v-col>
        <v-spacer class="d-none d-sm-block" />
        <v-col sm="4">
          <!-- scroll to prices/dates or different page ? -->
          <v-btn-secondary
            rounded="sm"
            class="text-caption text-uppercase"
            width="100%"
          >
            <slot name="text-btn-1" />
          </v-btn-secondary>
        </v-col>
        <v-col sm="4">
          <v-btn-secondary
            rounded="sm"
            color="primary"
            class="text-caption text-uppercase"
            width="100%"
          >
            <template #prepend>
              <v-icon size="x-large">
                {{ mdiCalendar }}
              </v-icon>
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
