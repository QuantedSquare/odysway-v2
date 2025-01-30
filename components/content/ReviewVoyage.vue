<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        sm="10"
      >
        <v-row
          v-for="review, index in reviews"
          :key="`Avis sur voyage ${review.blogTitle}`"
          no-gutters
          justify="center"
        >
          <ReviewCard
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
            v-for="review, index in reviews"
            :key="`Avatar de voyageur ${review.author}`"
            cols="auto"
            class="d-flex flex-column align-center justify-center"
          >
            <v-avatar
              v-if="review.isOnHome"
              :border="currentReview === index ? 'lg' : ''"
              :size="currentReview === index ? '70': '60'"
              :class="currentReview === index ? 'opacity-100' : 'opacity-40'"
              @click="currentIndex(index)"
            >
              <v-img
                :src="review.photo"
                cover
              />
            </v-avatar>
            <div :class="$vuetify.display.smAndDown ? 'd-none' : 'd-flex flex-column align-center'">
              <span>{{ review.author }}</span>
              <span>{{ review.age }} ans </span>
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
const currentReview = ref(0)

function currentIndex(index) {
  return currentReview.value = index
}

const { data: reviews } = await useAsyncData('reviews', () => {
  return queryCollection('reviews').all()
})

console.log('current review => ', reviews.value[0].photo)
</script>
