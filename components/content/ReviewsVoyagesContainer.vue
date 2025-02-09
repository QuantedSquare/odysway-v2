<template>
  <v-container>
    <v-row
      justify="center"
      class="row-height"
    >
      <v-col
        cols="12"
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
    </v-row>
    <v-row>
      <v-col
        cols="12"
      >
        <v-row
          justify="center"
          class="mt-4"
        >
          <ReviewerAvatars
            :items="reviewsList"
            @change-index="handleIndex"
          />
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
          <v-btn-secondary>
            Lire d'autres avis voyageurs
          </v-btn-secondary>
        </NuxtLink>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

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

const handleIndex = (index) => {
  currentReview.value = index
}
</script>

<style scoped>
.row-height {
  height: auto;
}
</style>
