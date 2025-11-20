<template>
  <!-- v-if="published" -->
  <v-card
    elevation="0"
    :href="`${path}`"
    height="460px"
    class="text-decoration-none"
  >
    <v-img
      :src="img(displayedImg, { format: 'webp', quality: 90, height: 228, width: 640 })"
      :alt="`image de ${title}`"
      height="261px"
      cover
    >
      <div
        v-if="badgeColor"
        class="badge-position"
      >
        <v-chip
          size="x-large"
          class="text-subtitle-2 text-white font-weight-bold px-5 d-flex align-center"
        variant="tonal"
        >
        <span class="mb-1 text-shadow">
          {{ type }}
        </span>
        </v-chip>
      </div>
    </v-img>

    <!--  BOTTOM TEXT -->
    <v-card-text class="pb-0">
      <v-container class="pb-0">
        <v-row>
          <v-col cols="12">
            <div class="text-primary text-h4 font-weight-bold py-1 px-0 no-white-space ">
              <div
                class="line-clamp-2"
                :aria-describedby="title.length > 60 ? `tooltip-${title}` : undefined"
              >
                {{ title }}
              </div>
              <v-tooltip
                v-if="title.length > 60"
                :id="`tooltip-${title}`"
                activator="parent"
                :aria-label="`Titre complet du blog: ${title}`"
              >
                <span>
                  {{ title }}
                </span>
              </v-tooltip>
            </div>
          </v-col>
          <v-spacer />
          <v-divider />
          <v-col
            cols="12"
            class="d-flex justify-space-between align-center text-secondary-light-2 text-h5 mt-4"
          >
            <div
              v-if="readingTime"
              class="d-flex align-center ga-2"
            >
              <v-icon size="small">
                {{ mdiClockTimeThreeOutline }}
              </v-icon>

              <span>
                {{ readingTime }} min
              </span>
            </div>
            <div class="text-grey text-right">
              {{ formatDate(publishedAt, 'DD MMMM YYYY') }}
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { mdiClockTimeThreeOutline } from '@mdi/js'
import { useImage } from '#imports'

defineProps({
  path: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  displayedImg: {
    type: String,
    required: true,
  },
  published: {
    type: Boolean,
    required: true,
  },
  publishedAt: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'Actu',
  },
  badgeColor: {
    type: String,
    default: 'secondary',
  },
  readingTime: {
    type: String,
    default: '3',
  },
})

const img = useImage()
</script>

<style scoped>
.badge-position{
  position: absolute;
  top: 25px;
  right: 28px;
}
.line-clamp-2{
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
