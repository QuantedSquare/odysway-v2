<template>
  <v-container
    fluid
    class="mt-5 mb-1"
  >
    <v-row
      v-if="badgeSection"
      class="flex-nowrap overflow-auto hidden-scroll flex-md-wrap"
    >
      <v-col
        cols="12"
        class="d-flex flex-nowrap ga-4 flex-md-wrap min-width"
      >
        <v-chip
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          :color="badgeSection.experienceBadge.color"
          density="comfortable"
        >
          <span class="d-flex align-center text-white text-caption text-sm-subtitle-2  px-3">
            <div v-dompurify-html="parseBoldText(badgeSection.experienceBadge.text)" />
          </span>
        </v-chip>

        <v-chip
          v-for="(chip, index) in badgeSection.otherBadges"
          :key="index"
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          :color="chip.color"
        >
          <span class="d-flex text-primary text-caption text-sm-subtitle-2  px-2">
            <v-img
              :src="chip.icon"
              :height="lgAndUp ? 20 : 18"
              :width="lgAndUp ? 20 : 18"
              class="mr-3"
            />
            <div v-dompurify-html="parseBoldText(chip.text)" />
          </span>
        </v-chip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { badgeSection } = inject('voyage')
const { lgAndUp } = useDisplay()

// const chips = {
//   experience: {
//     text: badgeSection.experience,
//     color: badgeSection.experienceColor,
//   },
//   minMaxTravellers: '3 à 8',
//   nbNights: 7,
//   flightIncluded: true,
//   hotelStars: 4,
//   bestSeason: 'Printemps-été',
// }

// const chipData = [
//   {
//     text: `Groupe ${chips.minMaxTravellers} personnes`,
//     iconProps: {
//       src: '/icons/business-team.svg',
//       iconSize: iconSize.value,
//     },
//   },
//   {
//     text: `${chips.nbNights} nuits sur place`,
//     iconProps: {
//       src: '/icons/calendar.svg',
//       iconSize: iconSize.value,
//     },
//   },
//   {
//     text: `Vol ${chips.flightIncluded ? 'compris' : 'non compris'}`,
//     iconProps: {
//       src: '/icons/airplane.svg',
//       iconSize: iconSize.value,
//     },
//   },
//   {
//     text: `Hôtel ${chips.hotelStars} étoiles`,
//     iconProps: {
//       src: '/icons/bed.svg',
//       iconSize: iconSize.value,
//     },
//   },
//   {
//     text: chips.bestSeason,
//     iconProps: {
//       src: '/icons/sun.svg',
//       iconSize: iconSize.value,
//     },
//   },
// ]
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
