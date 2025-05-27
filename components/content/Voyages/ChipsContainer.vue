<template>
  <v-container
    fluid
    class="mt-5 mb-1"
  >
    <v-row
      v-if="badgeSection"
      class="d-flex  flex-wrap"
    >
      <v-col
        cols="12"
        class="d-flex  ga-4 flex-wrap"
      >
        <v-chip
          v-if="badgeSection.experienceBadge.visible"
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          :color="badgeSection.experienceBadge.color"
          density="comfortable"
        >
          <span class="d-flex align-center text-white text-caption text-sm-subtitle-2  px-3 mb-1 font-weight-bold">
            <div v-dompurify-html="parseBoldText(badgeSection.experienceBadge.text)" />
          </span>
        </v-chip>

        <v-chip
          v-if="badgeSection.groupeBadge.visible"
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1">
            <v-img
              :src="'/icons/business-team.svg'"
              :height="lgAndUp ? 20 : 18"
              :width="lgAndUp ? 20 : 18"
              class="mr-3"
            />
            <div v-dompurify-html="parseBoldText(badgeSection.groupeBadge.text)" />
          </span>
        </v-chip>

        <v-chip
          v-if="badgeSection.durationBadge.visible"
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1">
            <v-img
              :src="'/icons/calendar.svg'"
              :height="lgAndUp ? 20 : 18"
              :width="lgAndUp ? 20 : 18"
              class="mr-3"
            />
            <div v-dompurify-html="parseBoldText(badgeSection.durationBadge.text)" />
          </span>
        </v-chip>

        <v-chip
          v-if="badgeSection.includeFlightBadge.visible"
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1">
            <v-img
              :src="'/icons/airplane.svg'"
              :height="lgAndUp ? 20 : 18"
              :width="lgAndUp ? 20 : 18"
              class="mr-3"
            />
            <div v-dompurify-html="parseBoldText(badgeSection.includeFlightBadge.text)" />
          </span>
        </v-chip>

        <v-chip
          v-if="badgeSection.housingBadge.visible"
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1">
            <v-img
              :src="'/icons/bed.svg'"
              :height="lgAndUp ? 20 : 18"
              :width="lgAndUp ? 20 : 18"
              class="mr-3"
            />
            <div v-dompurify-html="parseBoldText(badgeSection.housingBadge.text)" />
          </span>
        </v-chip>

        <v-chip
          v-if="badgeSection.periodBadge.visible"
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1 font-weight-bold">
            <v-img
              :src="'/icons/sun.svg'"
              :height="lgAndUp ? 20 : 18"
              :width="lgAndUp ? 20 : 18"
              class="mr-3"
            />
            <div v-dompurify-html="parseBoldText(badgeSection.periodBadge.text)" />
          </span>
        </v-chip>
        <v-chip
          v-if="+level >= 1"
          variant="flat"
          :size="lgAndUp ? 'x-large' : 'large'"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1">
            <v-icon
              :icon="level === '1' ? mdiSignalCellular1 : level === '2' ? mdiSignalCellular2 : mdiSignalCellular3"
              class="mr-3"
            />

            <span class="font-weight-bold">Niveau {{ level }}</span>
          </span>
        </v-chip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { mdiSignalCellular1, mdiSignalCellular2, mdiSignalCellular3 } from '@mdi/js'

defineProps({
  badgeSection: {
    type: Object,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
})
const { lgAndUp } = useDisplay()
</script>
