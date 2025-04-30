<template>
  <v-container fluid>
    <v-row
      v-if="chips"
      class="flex-nowrap overflow-auto hidden-scroll flex-md-wrap"
    >
      <v-col
        cols="12"
        class="d-flex flex-nowrap ga-4 flex-md-wrap min-width"
      >
        <v-chip
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          :color="chips.experience.color"
          class="px-2"
        >
          <span class="text-white text-caption text-md-subtitle-2 font-weight-bold">
            {{ chips.experience.text }}
          </span>
        </v-chip>

        <v-chip
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="grey-light-2"
          class="px-4 btn-shadow"
        >
          <template #prepend>
            <v-img
              :height="lgAndUp ? 20: 18"
              :width="lgAndUp ? 20 : 18"
              src="/public/icons/Business-Team-Goal--Streamline-Ultimate.svg"
              class="mr-3"
            />
          </template>
          <span class="text-primary text-caption text-md-subtitle-2 font-weight-bold">
            Groupe {{ chips.minMaxTravellers }} personnes
          </span>
        </v-chip>

        <v-chip
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="grey-light-2"
          class="px-4 btn-shadow"
        >
          <template #prepend>
            <v-icon
              :icon="mdiCalendarBlankOutline"
              :size="lgAndUp ? 20 : 18"
              color="primary"
              class="mr-3"
            />
          </template>
          <span class="text-primary text-caption text-md-subtitle-2 font-weight-bold">
            {{ chips.nbNights }} nuits sur place
          </span>
        </v-chip>

        <v-chip
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="grey-light-2"
          class="px-4 btn-shadow"
        >
          <template #prepend>
            <v-img
              src="/public/icons/airplane.svg"
              :height="lgAndUp ? 20: 18"
              :width="lgAndUp ? 20 : 18"
              class="mr-3"
            />
          </template>
          <span class="text-primary text-caption text-md-subtitle-2 font-weight-bold">
            Vol {{ chips.flightIncluded ? 'compris' : 'non compris' }}
          </span>
        </v-chip>

        <v-chip
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="grey-light-2"
          class="px-4 btn-shadow"
        >
          <template #prepend>
            <v-img
              :height="lgAndUp ? 20: 18"
              :width="lgAndUp ? 20 : 18"
              src="/public/icons/bed.svg"
              class="mr-3"
            />
          </template>
          <span class="text-primary text-caption text-md-subtitle-2 font-weight-bold">
            Hôtel {{ chips.hotelStars }} étoiles
          </span>
        </v-chip>

        <v-chip
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="grey-light-2"
          class="px-4 btn-shadow"
        >
          <template #prepend>
            <v-img
              :height="lgAndUp ? 20: 18"
              :width="lgAndUp ? 20 : 18"
              src="/public/icons/sun.svg"
              class="mr-3"
            />
          </template>
          <span class="text-primary text-caption text-md-subtitle-2 font-weight-bold">{{ chips.bestSeason }} </span>
        </v-chip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiCalendarBlankOutline } from '@mdi/js'
import { useDisplay } from 'vuetify'

const { lgAndUp } = useDisplay()

const chips = {
  experience: {
    text: 'Dans la peau de blablabla... ',
    color: 'yellow',
  },
  minMaxTravellers: '3 à 8',
  nbNights: 7,
  flightIncluded: true,
  hotelStars: 4,
  bestSeason: 'Printemps-été',
}
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}

@media screen and (max-width: 960px) {
  .min-width {
    min-width: max-content
  }
}
</style>
