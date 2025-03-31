<template>
  <v-app-bar
    location="bottom"
    class="d-md-none pb-1 pb-sm-0 bottom-app-bar"
  >
    <v-container class="py-0">
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
          <v-btn-secondary
            rounded="sm"
            class="text-caption text-uppercase"
            width="100%"
            @click="goTo('#dates-container', { offset: -200 })"
          >
            <slot name="text-btn-1" />
          </v-btn-secondary>
        </v-col>
        <v-col sm="4">
          <v-btn-secondary
            rounded="sm"
            color="primary"
            class="text-caption text-uppercase text-decoration-none"
            width="100%"
            href="/calendly"
          >
            <template #prepend>
              <v-icon size="x-large">
                {{ mdiCalendar }}
              </v-icon>
            </template>
            <slot name="text-btn-2" />
          </v-btn-secondary>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { mdiCalendar } from '@mdi/js'
import { useGoTo } from 'vuetify'

const goTo = useGoTo()
</script>

<style scoped>
.bottom-app-bar{
  z-index: 1020 !important;
}
</style>
