<template>
  <v-container
    class="py-0"
    fluid
  >
    <v-row justify="center">
      <v-divider />
      <v-col>
        <p class="text-center text-overline text-grey mb-3 px-1">
          À lire aussi
        </p>
        <v-card
          elevation="0"
          rounded="xl"
          :href="`/blog/${slug}`"
          class="blog-teaser-card text-decoration-none overflow-hidden"
          bg-color="soft-blush"
        >
          <v-row no-gutters>
            <v-col
              cols="12"
              sm="5"
            >
              <SanityImage
                v-if="displayedImg?.asset?._ref"
                :asset-id="displayedImg.asset._ref"
                auto="format"
              >
                <template #default="{ src }">
                  <v-img
                    :src="src"
                    :lazy-src="img(src, { format: 'webp', quality: 10, height: 360, width: 560 })"
                    :alt="`Illustration : ${title}`"
                    cover
                    class="blog-teaser-img"
                  />
                </template>
              </SanityImage>
            </v-col>
            <v-col
              cols="12"
              sm="7"
            >
              <v-card-text class="d-flex flex-column h-100 pa-6 pa-sm-8">
                <div
                  v-if="category"
                  class="mb-4"
                >
                  <v-chip
                    color="secondary"
                    variant="tonal"
                    size="small"
                    class="font-weight-bold text-uppercase"
                  >
                    {{ category }}
                  </v-chip>
                </div>

                <div class="text-primary text-h4 font-weight-bold line-clamp-2 mb-3">
                  {{ title }}
                </div>

                <div
                  v-if="description"
                  class="text-grey text-h5 line-clamp-3 mb-4"
                >
                  {{ description }}
                </div>

                <v-spacer />

                <v-divider class="mb-4 border-opacity-25" />

                <div class="d-flex align-center justify-space-between flex-wrap ga-2 text-grey text-h5">
                  <div class="d-flex align-center ga-4">
                    <div
                      v-if="readingTime"
                      class="d-flex align-center ga-1"
                    >
                      <v-icon
                        :icon="mdiClockTimeThreeOutline"
                        size="15"
                      />
                      <span>{{ readingTime }} min</span>
                    </div>
                    <div
                      v-if="author"
                      class="d-flex align-center ga-1"
                    >
                      <v-icon
                        :icon="mdiAccountOutline"
                        size="15"
                      />
                      <span>{{ author }}</span>
                    </div>
                  </div>
                  <span v-if="publishedAt">{{ formatDate(publishedAt, 'DD MMM YYYY') }}</span>
                </div>

                <v-btn
                  variant="outlined"
                  color="secondary"
                  rounded="pill"
                  size="small"
                  :append-icon="mdiArrowRight"
                  class="mt-5 align-self-start"
                >
                  Lire l'article
                </v-btn>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiClockTimeThreeOutline, mdiAccountOutline, mdiArrowRight } from '@mdi/js'
import { useImage } from '#imports'

defineProps({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  displayedImg: {
    type: [Object, String],
    default: null,
  },
  publishedAt: {
    type: String,
    default: null,
  },
  readingTime: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    default: null,
  },
  author: {
    type: String,
    default: null,
  },
})

const img = useImage()
</script>

<style scoped>
.blog-teaser-img {
  min-height: 220px;
  height: 100%;
}

.blog-teaser-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.blog-teaser-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.09) !important;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}
</style>
