<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        sm="10"
      >
        <v-window v-model="currentReview">
          <v-window-item
            v-for="review, index in reviewsList"
            :key="index"
          >
            <ReviewColCard
              :review="review"
            />
          </v-window-item>
        </v-window>
      </v-col>
      <v-col
        cols="12"
      >
        <v-row
          justify="center"
          class="mt-4"
        >
          <v-col
            v-for="review, index in reviewsList"
            :key="index"
            cols="auto"
            class="d-flex flex-column align-center"
          >
            <v-avatar
              :border="currentReview === index ? 'lg' : '' "
              :size="currentReview === index ? '70' : '60'"
              :class="currentReview === index ? 'opacity-100' : 'opacity-50'"
              :color="currentReview === index ? 'primary' : '' "
              @click="currentReview = index"
            >
              <v-img
                v-if="review.photo"
                :src="img(review.photo, { format: 'webp', quality: 70, height: 100, width: 100 })"
                :alt="`Photo de ${review.author}`"
                cover
              />
              <span
                v-if="!review.photo"
              >{{ review.author[0] }}</span>
            </v-avatar>
            <div
              :class="currentReview === index ? 'd-none d-md-flex flex-column align-center' : 'd-none'"
              class="text-dark"
            >
              <span class="text-h6 font-weight-bold ">{{ review.author }}</span>
              <span>{{ review.authorAge }} ans </span>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        cols="12"
        class="d-flex justify-center"
      >
        <NuxtLink
          to="https://fr.trustpilot.com/review/odysway.com"
          target="blank"
        >
          <VBtnSecondary>
            Lire d'autres avis voyageurs
          </VBtnSecondary>
        </NuxtLink>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const img = useImage()
const currentReview = ref(0)
const { smAndUp } = useDisplay()

const { data: reviews } = await useAsyncData('reviews', () => {
  return queryCollection('reviews').all()
})

const onHomeReviews = computed(() => {
  return reviews.value.filter(r => r.isOnHome)
})

const reviewsList = computed(() => {
  return smAndUp.value ? onHomeReviews.value : onHomeReviews.value.slice(0, 3)
})
</script>
