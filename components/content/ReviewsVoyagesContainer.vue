<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        sm="10"
      >
        <v-row
          v-for="review, index in reviewsList"
          :key="`Avis sur voyage ${review.blogTitle + index}`"
          no-gutters
          justify="center"
        >
          <ReviewColCard
            v-if="review.isOnHome && currentReview === index "
            :review="review"
          />
        </v-row>
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
            :key="`Avatar de voyageur ${review.author}`"
            cols="auto"
            class="d-flex flex-column align-center justify-center"
          >
            <v-avatar
              v-show="review.isOnHome"
              :border="currentReview === index ? 'lg' : '' "
              :size="currentReview === index ? '70' : '60'"
              :class="currentReview === index ? 'opacity-100' : 'opacity-50'"
              :color="currentReview === index ? 'primary' : '' "
              @click="currentReview = index"
            >
              <v-img
                v-show="review.photo"
                :src="img(review.photo, { format: 'webp', quality: 70, height: 100, width: 100 })"
                :alt="`Photo de ${review.author}`"
                cover
              />
              <span
                v-show="!review.photo"
              >{{ review.author[0] }}</span>
            </v-avatar>
            <div
              :class="currentReview === index ? 'd-none d-md-flex flex-column align-center' : 'd-none'"
              class="text-textColor"
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

const reviewsList = computed(() => {
  const list = [...(reviews.value || [])]
  return smAndUp.value ? list : list.slice(0, 3)
})
</script>
