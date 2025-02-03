<template>
  <v-col
    v-if="review.isOnHome"
    cols="12"
  >
    <v-card justify="center">
      <v-container>
        <v-row>
          <v-col
            cols="12"
            md="5"
            xl="4"
            class="d-flex flex-column justify-center align-center"
          >
            <v-avatar
              size="72"
              class=" mt-6"
              border="lg"
              color="primary"
            >
              <v-img
                v-if="review.photo"
                :src="img(review.photo, { format: 'webp', quality: 70, height: 100, width: 100 })"
                :alt="`Photo de ${review.author}`"
                cover
              />
              <span
                v-else
              >{{ review.author[0] }}</span>
            </v-avatar>
            <v-card-title>
              {{ review.author }}
            </v-card-title>
            <v-card-subtitle class="text-textColor text-uppercase text-caption no-white-space px-0">
              Son voyage :
            </v-card-subtitle>
            <v-card-title class="text-textColor text-subtitle-1 font-weight-bold no-white-space px-0">
              <NuxtLink
                :to="`/voyages/${review.voyageSlug}`"
                class="text-primary text-center"
              >
                <h4>
                  {{ review.voyageTitle }}
                </h4>
              </NuxtLink>
            </v-card-title>
          </v-col>
          <v-col
            cols="12"
            md="7"
            xl="8"
            class="d-flex align-center"
          >
            <v-row>
              <v-col
                cols="auto"
              >
                <v-img
                  :src="img('/images/guillemet-gauche.svg', { format: 'webp', quality: 70 })"
                  width="25"
                  height="14"
                  contain
                />
              </v-col>
              <v-col class="px-0">
                <v-card-text class="text-body-1 text-center px-0">
                  {{ review.text }}
                </v-card-text>
              </v-col>
              <v-col cols="auto">
                <v-img
                  :src="img('/images/guillemet-droite.svg', { format: 'webp', quality: 70 })"
                  width="25"
                  height="13"
                  contain
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-col>
</template>

<script setup>
import { useImage } from '#imports'

const props = defineProps({
  reviewSlug: {
    type: String,
    required: true,
  },
})

const img = useImage()

const { data: review } = await useAsyncData(`review-${props.reviewSlug}`, () => {
  return queryCollection('reviews').where('slug', '=', props.reviewSlug).first()
})
</script>

<style scoped>
.no-white-space {
  white-space: normal;
}
</style>
