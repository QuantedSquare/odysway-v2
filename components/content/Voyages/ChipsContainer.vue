<template>
  <v-container
    fluid
    class="mt-5 mb-1"
  >
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
          :size="chipSize"
          :color="chips.experience.color"
          class="px-2"
        >
          <span class="text-white text-caption text-sm-subtitle-2 font-weight-bold">
            {{ chips.experience.text }}
          </span>
        </v-chip>

        <v-chip
          v-for="(chip, index) in chipData"
          :key="index"
          variant="flat"
          :size="chipSize"
          color="grey-light-2"
          class="px-4 btn-shadow"
        >
          <template #prepend>
            <v-img
              :src="chip.iconProps.src"
              :height="chip.iconProps.iconSize"
              :width="chip.iconProps.iconSize"
              class="mr-3"
            />
          </template>

          <span class="text-primary text-caption text-sm-subtitle-2 font-weight-bold">
            {{ chip.text }}
          </span>
        </v-chip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { lgAndUp } = useDisplay()
const chipSize = computed(() => (lgAndUp.value ? 'x-large' : 'large'))

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

const iconSize = computed(() => (lgAndUp.value ? 20 : 18))

const chipData = [
  {
    text: `Groupe ${chips.minMaxTravellers} personnes`,
    iconProps: {
      src: '/icons/business-team.svg',
      iconSize: iconSize.value,
    },
  },
  {
    text: `${chips.nbNights} nuits sur place`,
    iconProps: {
      src: '/icons/calendar.svg',
      iconSize: iconSize.value,
    },
  },
  {
    text: `Vol ${chips.flightIncluded ? 'compris' : 'non compris'}`,
    iconProps: {
      src: '/icons/airplane.svg',
      iconSize: iconSize.value,
    },
  },
  {
    text: `Hôtel ${chips.hotelStars} étoiles`,
    iconProps: {
      src: '/icons/bed.svg',
      iconSize: iconSize.value,
    },
  },
  {
    text: chips.bestSeason,
    iconProps: {
      src: '/icons/sun.svg',
      iconSize: iconSize.value,
    },
  },
]
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
    min-width: max-content;
  }
}
</style>
