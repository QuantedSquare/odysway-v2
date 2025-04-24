<template>
  <v-container
    :fluid="width < 1440"
  >
    <v-row
      align="center"
    >
      <v-col
        cols="8"
        sm="10"
        class="text-h3 font-weight-bold my-4"
      >
        Des idées pour vos prochains voyages
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-tabs
          v-model="currentTab"
          class="text-grey position-relative mb-6"
          color="white"
        >
          <v-divider
            class="absolute-divider"
            thickness="2"
          />

          <v-tab :value="0">
            <span class="font-weight-bold">Voyages</span>
          </v-tab>
          <v-tab :value="1">
            <span class="font-weight-bold">Voyages</span>
          </v-tab>
          <v-tab :value="2">
            <span class="font-weight-bold">Voyages</span>
          </v-tab>
          <v-tab :value="3">
            <span class="font-weight-bold">Voyages</span>
          </v-tab>
        </v-tabs>
        <v-tabs-window
          v-model="currentTab"
        >
          <v-tabs-window-item :value="0">
            <v-row class="mb-16 pb-16">
              <v-col
                cols="6"
                md="2"
              >
                <h5 class="text-h4 font-weight-bold mb-10">
                  Top voyages
                </h5>
                <div class="d-flex flex-column ga-2">
                  <NuxtLink
                    v-for="link, index in linksList"
                    :key="`${link.label}-${index}`"
                    :to="link.to"
                    class="text-grey"
                  >
                    {{ link.label }}
                  </NuxtLink>
                </div>
              </v-col>
            </v-row>
          </v-tabs-window-item>
          <v-tabs-window-item :value="1">
            <span class="text-white font-weight-bold">Coucou</span>
          </v-tabs-window-item>
          <v-tabs-window-item :value="2">
            <span class="text-white font-weight-bold">Coucou</span>
          </v-tabs-window-item>
          <v-tabs-window-item :value="3">
            <span class="text-white font-weight-bold">Coucou</span>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
const currentTab = ref(0)

const linksList = [
  {
    label: 'Voyage 1',
    to: '/voyage-1',
  },
  {
    label: 'Voyage 2',
    to: '/voyage-2',
  },
]
</script>

<style scoped>
.absolute-divider {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
