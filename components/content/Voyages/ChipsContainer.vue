<template>
  <v-container
    fluid
    class="pt-2 mt-0 mt-md-5 mb-1 px-0 pb-1 pb-md-3"
  >
    <v-row
      v-if="badgeSection"
      class="d-flex  flex-wrap text-custom  custom-chip-height"
    >
      <v-col
        cols="12"
        class="d-flex  ga-2 ga-md-4 flex-wrap"
      >
        <v-chip
          v-if="badgeSection.experienceBadge.visible && badgeSection.experienceBadge.text"
          variant="flat"
          size="large"
          class="chip-responsive"
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
          size="large"
          class="chip-responsive"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1">
            <v-img
              :src="'/icons/business-team.svg'"
              height="18"
              width="18"
              class="mr-3 icon-responsive"
              alt="Icone d'un groupe de personnes"
            />
            <div v-dompurify-html="parseBoldText(badgeSection.groupeBadge.text)" />
          </span>
        </v-chip>

        <v-chip
          v-if="badgeSection.durationBadge.visible"
          variant="flat"
          size="large"
          class="chip-responsive"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1">
            <v-img
              :src="'/icons/calendar.svg'"
              height="18"
              width="18"
              class="mr-3 icon-responsive"
              alt="Icone d'un calendrier"
            />
            <div v-dompurify-html="parseBoldText(badgeSection.durationBadge.text)" />
          </span>
        </v-chip>

        <v-chip
          v-if="badgeSection.includeFlightBadge.visible"
          variant="flat"
          size="large"
          class="chip-responsive"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1">
            <v-img
              :src="'/icons/airplane.svg'"
              height="18"
              width="18"
              class="mr-3 icon-responsive"
              alt="Icone d'un avion"
            />
            <div v-dompurify-html="parseBoldText(badgeSection.includeFlightBadge.text)" />
          </span>
        </v-chip>

        <v-chip
          v-if="badgeSection.housingBadge.visible"
          variant="flat"
          size="large"
          class="chip-responsive"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1">
            <v-img
              :src="'/icons/bed.svg'"
              height="18"
              width="18"
              class="mr-3 icon-responsive"
              alt="Icone d'un lit"
            />
            <div v-dompurify-html="parseBoldText(badgeSection.housingBadge.text)" />
          </span>
        </v-chip>

        <v-chip
          v-if="badgeSection.periodBadge.visible"
          variant="flat"
          size="large"
          class="chip-responsive"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1 font-weight-bold">
            <v-img
              :src="'/icons/sun.svg'"
              height="18"
              width="18"
              class="mr-3 icon-responsive"
              alt="Icone d'un soleil"
            />
            <div v-dompurify-html="parseBoldText(badgeSection.periodBadge.text)" />
          </span>
        </v-chip>
        <v-chip
          v-if="+level >= 1"
          variant="flat"
          size="large"
          class="chip-responsive"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2  px-3 mb-1">
            <v-icon
              :icon="level === '1' ? mdiSignalCellular1 : level === '2' ? mdiSignalCellular2 : mdiSignalCellular3"
              class="mr-3 icon-responsive"
              :alt="`Icone d'un niveau de difficulté ${level}`"
            />

            <span class="font-weight-bold">Niveau {{ level }}</span>
          </span>
        </v-chip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
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
</script>

<style scoped>
  .custom-chip-height:deep(.v-chip){
    height: 25px!important;
  }

  .text-custom:deep(.v-chip){
    font-size: 10px!important;
  }

  /* Responsive chip sizing */
  .chip-responsive {
    font-size: 10px !important;
  }

  /* Responsive icon sizing */
  .icon-responsive {
    height: 18px !important;
    width: 18px !important;
  }

  @media screen and  (min-width: 400px) {
  .custom-chip-height:deep(.v-chip){
    height: 30px!important;
  }
}
  @media screen and  (min-width: 900px) {
    .text-custom:deep(.v-chip){
    font-size: 16px!important;
  }

  .chip-responsive {
    font-size: 16px !important;
  }

  .icon-responsive {
    height: 20px !important;
    width: 20px !important;
  }
}

@media screen and (min-width: 960px) {
  .custom-chip-height:deep(.v-chip){
    height: 46px!important;
  }
}
</style>
