<template>
  <div
    class="rounded-xl"
    :class="`bg-${backgroundColor}`"
  >
    <v-container
      fluid
      class="pa-0"
      :class="displayedImg?.asset?._ref ? 'custom-hero-height' : 'py-6'"
    >
      <v-row
        class="ma-0 h-100 flex-column-reverse flex-md-row"
      >
        <v-col
          cols="12"
          :md="displayedImg?.asset?._ref ? 5 : 12"
          class="d-flex flex-column justify-center ga-6 ga-md-8 pl-md-8"
        >
          <div
            v-if="blogType || badgeColor || readingTime || publishedAt"
            class="text-body-2 text-lg-body-1 d-flex align-center ga-3"
          >
            <v-chip
              v-if="blogType && badgeColor"
              size="x-large"
              class="text-body-2 font-weight-bold px-5"
              :class="`bg-${badgeColor}`"
            >
              <div class="mb-1">
                {{ blogType }}
              </div>
            </v-chip>
            <div
              v-if="readingTime && badgeColor"
              class="d-flex align-center ga-2 font-weight-2"
              :class="`text-${badgeColor ?? 'primary'}`"
            >
              <v-icon size="24px">
                {{ mdiClockTimeThreeOutline }}
              </v-icon>
              {{ readingTime }} min
            </div>
            <div
              v-if="publishedAt"
              class="text-grey"
            >
              {{ formatDate(publishedAt) }}
            </div>
          </div>
          <h1
            class="text-center text-md-left text-h4 text-lg-h1 font-weight-bold"
            :class="`text-${titleColor}`"
          >
            <slot name="title" />
          </h1>
          <div
            class="text-h6 text-lg-h5 font-weight-medium max-lines overflow-y-auto"
            :class="`text-${introductionColor}`"
            style="max-height: 320px;"
          >
            <slot name="introduction" />
          </div>
          <div
            v-if="author || authorPhoto || authorRole"
            class="d-flex align-center ga-4"
          >
            <AvatarImg
              v-if="authorPhoto"
              :avatar-img="authorPhoto"
              :avatar-size="avatarSize"
            />
            <div class="text-body-2 text-lg-body-1 d-flex flex-column justify-center align-start ga-4">
              <div
                v-if="author"
                class="text-primary font-weight-bold"
              >
                {{ author }}
              </div>
              <div
                v-if="authorRole"
                class="text-grey"
              >
                {{ authorRole }}
              </div>
            </div>
          </div>
        </v-col>
        <v-spacer />
        <v-col
          v-if="displayedImg?.asset?._ref"
          cols="12"
          md="6"
          class="pa-0 fixed-height"
        >
          <div class="hero-img-wrapper">
            <SanityImage

              :asset-id="displayedImg?.asset?._ref"
              auto="format"
            >
              <template #default="{ src }">
                <v-img
                  :src="src"
                  :lazy-src="img(src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
                  cover
                  :alt="`Image principale du blog ${title || ''}`"
                  :class="smAndDown ? 'rounded-t-lg' : 'rounded-e-lg'"
                />
              </template>
            </SanityImage>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { mdiClockTimeThreeOutline } from '@mdi/js'
import { useDisplay } from 'vuetify'
import dayjs from 'dayjs'
import { useImage } from '#imports'

defineProps({
  backgroundColor: { type: String, default: 'primary' },
  titleColor: { type: String, default: 'white' },
  introductionColor: { type: String, default: 'grey' },
  avatarSize: { type: String, default: '60' },
  // Blog info
  blogType: String,
  badgeColor: String,
  readingTime: [String, Number],
  publishedAt: String,
  // Author info
  author: String,
  authorPhoto: Object,
  authorRole: String,
  // Image
  displayedImg: Object,
  // Title (for alt)
  title: String,
})

const { smAndDown } = useDisplay()
const img = useImage()

function formatDate(date) {
  if (!date) return ''
  return dayjs(date).format('DD MMMM YYYY')
}
</script>

<style scoped>
.font-weight-2{
  font-weight: 500;
}
.fixed-height {
  height: 100%;
}
.custom-hero-height {
  height:  800px;
}
.hero-img-wrapper {

  height: 100%;
  width: 100%;
  min-height: 220px;
  max-height: 800px;
  overflow: hidden;
  display: flex;
}
@media (max-width: 960px) {
  .custom-hero-height {
    height:100%;
  }
  .fixed-height {
    min-height: 20vh;
  }
  .hero-img-wrapper {
    aspect-ratio: 3/2;
    min-height: 180px;
    max-height: 350px;
  }
}
@media (max-width: 400px) {
  .fixed-height {
    min-height: 10vh;
  }

}
</style>
