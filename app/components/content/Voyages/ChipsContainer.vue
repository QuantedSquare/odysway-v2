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
        class="d-flex ga-2 ga-md-4 flex-wrap align-center"
      >
        <!-- <v-chip
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
        </v-chip> -->

        <TransitionGroup
          name="chip"
          tag="div"
          class="chips-group d-flex ga-2 ga-md-4 flex-wrap align-center"
        >
          <v-chip
            v-for="chip in visibleChips"
            :key="chip.key"
            variant="flat"
            size="large"
            class="chip-responsive"
            color="grey-light"
            density="comfortable"
          >
            <span
              v-if="chip.type === 'badge'"
              class="d-flex align-center text-primary text-caption text-sm-subtitle-2 px-3 mb-1"
            >
              <v-img
                v-if="chip.pictoUrl"
                :src="chip.pictoUrl"
                height="18"
                width="18"
                class="mr-3 icon-responsive"
                :alt="chip.title || 'Badge icon'"
              />
              <div>{{ chip.displayText }}</div>
            </span>
            <span
              v-else
              class="d-flex align-center text-primary text-caption text-sm-subtitle-2 px-3 mb-1"
            >
              <v-img
                :src="levelIcon.icon"
                class="mr-3 icon-responsive"
                :alt="levelIcon.alt"
              />
              <span class="mr-2">Niveau {{ difficultyLevel.level }}</span>
              <v-tooltip
                location="bottom"
                max-width="500"
                role="tooltip"
                :aria-label="`Description du niveau de difficulté: ${difficultyLevel.description}`"
              >
                <template #activator="{ props }">
                  <v-icon v-bind="props">{{ mdiInformationOutline }}</v-icon>
                </template>
                <PortableText :value="difficultyLevel.description" />
              </v-tooltip>
            </span>
          </v-chip>
        </TransitionGroup>

        <button
          v-if="allChips.length > VISIBLE_LIMIT"
          class="toggle-chip"
          @click="showAll = !showAll"
        >
          <span v-if="!showAll">+ {{ hiddenCount }}</span>
          <v-icon
            class="toggle-icon"
            :class="{ 'toggle-icon--open': showAll }"
          >
            {{ mdiChevronDown }}
          </v-icon>
        </button>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiInformationOutline, mdiChevronDown } from '@mdi/js'
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

const VISIBLE_LIMIT = 3
const showAll = ref(false)

const processedBadges = computed(() => {
  if (!badges || badges.length === 0) return []

  return badges.map((badgeItem) => {
    if (!badgeItem.badge) return null
    let displayText = badgeItem.badge.text || ''

    if (badgeItem.overrideText) {
      displayText = badgeItem.overrideText
    }
    else {
      if (badgeItem.variable1Value) {
        displayText = displayText.replace(/\{var1\}/g, badgeItem.variable1Value)
      }
      if (badgeItem.variable2Value) {
        displayText = displayText.replace(/\{var2\}/g, badgeItem.variable2Value)
      }
    }

    const pictoUrl = badgeItem.badge.picto?.asset?._ref
      ? getImageUrl(badgeItem.badge.picto.asset._ref)
      : ''

    return {
      title: badgeItem.badge.title,
      displayText,
      pictoUrl,
    }
  }).filter(Boolean)
})

const allChips = computed(() => {
  const chips = processedBadges.value.map((badge, i) => ({
    key: `badge-${i}`,
    type: 'badge',
    ...badge,
  }))
  if (difficultyLevel.level > 0) {
    chips.push({ key: 'difficulty', type: 'difficulty' })
  }
  return chips
})

const visibleChips = computed(() =>
  showAll.value ? allChips.value : allChips.value.slice(0, VISIBLE_LIMIT),
)

const hiddenCount = computed(() => Math.max(0, allChips.value.length - VISIBLE_LIMIT))

const levelIcon = computed(() => ({
  icon: `/icons/level-${difficultyLevel.level}.svg`,
  alt: `Icone d'un niveau de difficulté ${difficultyLevel.title}`,
}))
</script>

<style scoped>
.custom-chip-height:deep(.v-chip){
  height: 25px!important;
}

.text-custom:deep(.v-chip){
  font-size: 10px!important;
}

.chip-responsive {
  font-size: 10px !important;
}

.icon-responsive {
  height: 18px !important;
  width: 18px !important;
}

.chips-group {
  position: relative;
}

/* TransitionGroup animations */
.chip-enter-active {
  transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}
.chip-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
  position: absolute;
}
.chip-enter-from,
.chip-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* Toggle button */
.toggle-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: 1px dashed rgba(0, 0, 0, 0.38);
  border-radius: 999px;
  padding: 0 15px;
  height: 25px;
  font-size: 10px;
  cursor: pointer;
  background: transparent;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}

.toggle-icon {
  font-size: 16px !important;
  transition: transform 0.3s ease;
}

.toggle-icon--open {
  transform: rotate(180deg);
}

@media screen and (min-width: 400px) {
  .custom-chip-height:deep(.v-chip){
    height: 30px!important;
  }

  .toggle-chip {
    height: 30px;
  }
}

@media screen and (min-width: 900px) {
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

  .toggle-chip {
    font-size: 16px;
    padding: 0 14px;
  }

  .toggle-icon {
    font-size: 20px !important;
  }
}

@media screen and (min-width: 960px) {
  .custom-chip-height:deep(.v-chip){
    height: 46px!important;
  }

  .toggle-chip {
    height: 46px;
  }
}
</style>
