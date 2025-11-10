<template>
  <v-container
    fluid
    class="pt-2 mt-0 mt-md-5 mb-1 px-0 pb-1 pb-md-3"
  >
    <v-row
      v-if="badges || badgeTitle"
      class="d-flex flex-wrap text-custom custom-chip-height"
    >
      <v-col
        cols="12"
        class="d-flex ga-2 ga-md-4 flex-wrap"
      >
        <v-chip
          v-if="badgeTitle"
          variant="flat"
          size="large"
          class="chip-responsive"
          density="comfortable"
          color="yellow"
        >
          <span
            class="d-flex align-center text-white text-caption text-sm-subtitle-2 px-3 mb-1 font-weight-bold"
          >
            {{ badgeTitle }}
          </span>
        </v-chip>

        <v-chip
          v-for="(badgeItem, index) in processedBadges"
          :key="index"
          variant="flat"
          size="large"
          class="chip-responsive"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2 px-3 mb-1">
            <v-img
              v-if="badgeItem.pictoUrl"
              :src="badgeItem.pictoUrl"
              height="18"
              width="18"
              class="mr-3 icon-responsive"
              :alt="badgeItem.title || 'Badge icon'"
            />
            <div>{{ badgeItem.displayText }}</div>
          </span>
        </v-chip>
        <v-chip
          v-if="difficultyLevel.level > 0"
          variant="flat"
          size="large"
          class="chip-responsive"
          color="grey-light"
          density="comfortable"
        >
          <span class="d-flex align-center text-primary text-caption text-sm-subtitle-2 px-3 mb-1">
            <v-img
              :src="levelIcon.icon"
              class="mr-3 icon-responsive"
              :alt="levelIcon.alt"
            />
            <span class="font-weight-bold mr-2">Niveau {{ difficultyLevel.level }}</span>
            <v-tooltip
              location="bottom"
              max-width="500"
            >
              <template #activator="{ props }">
                <v-icon v-bind="props">{{ mdiInformationOutline }}</v-icon>
              </template>

              <PortableText
                :value="difficultyLevel.description"
              />
            </v-tooltip>
          </span>
        </v-chip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiInformationOutline } from '@mdi/js'
import { PortableText } from '@portabletext/vue'
import { getImageUrl } from '~/utils/getImageUrl'

const { badges, difficultyLevel, badgeTitle } = defineProps({
  badges: {
    type: Array,
    default: () => [],
  },
  difficultyLevel: {
    type: Object,
    default: () => ({
      title: '',
      description: null,
      level: 0,
    }),
  },
  badgeTitle: {
    type: String,
    default: '',
  },
})

// Process badges to replace variables and get image URLs
const processedBadges = computed(() => {
  if (!badges || badges.length === 0) return []

  return badges.map((badgeItem) => {
    if (!badgeItem.badge) return null

    // Start with the badge text
    let displayText = badgeItem.badge.text || ''

    // Priority: overrideText > variable replacement > default badge text
    if (badgeItem.overrideText) {
      displayText = badgeItem.overrideText
    }
    else {
      // Replace variables if provided
      if (badgeItem.variable1Value) {
        displayText = displayText.replace(/\{var1\}/g, badgeItem.variable1Value)
      }
      if (badgeItem.variable2Value) {
        displayText = displayText.replace(/\{var2\}/g, badgeItem.variable2Value)
      }
    }

    // Get picto URL
    const pictoUrl = badgeItem.badge.picto?.asset?._ref
      ? getImageUrl(badgeItem.badge.picto.asset._ref)
      : ''

    return {
      title: badgeItem.badge.title,
      displayText,
      pictoUrl,
    }
  }).filter(Boolean) // Remove null entries
})

const levelIcon = computed(() => {
  return {
    icon: `/icons/level-${difficultyLevel.level}.svg`,
    alt: `Icone d'un niveau de difficulté ${difficultyLevel.title}`,
  }
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
.max-width-200 {
  max-width: 800px!important;
}
</style>
