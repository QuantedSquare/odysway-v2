<template>
  <v-container>
    <v-row
      justify="center"
    >
      <v-col
        cols="12"
        class="d-flex flex-column align-center justify-center my-8"
      >
        <h3 class="d-flex align-center justify-center text-h5 text-lg-h4 pb-2">
          <v-icon color="#ffc658">
            {{ mdiStar }}
          </v-icon>
          <span>
            {{ averageNote }}/{{ maxNote }}
            <slot
              name="first-phrase"
              mdc-unwrap="p"
            />
            {{ displayedReviews.length }} avis
          </span>
        </h3>
        <p class="text-center mb-4">
          <slot name="second-phrase" />
        </p>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col
        cols="12"
        md="10"
        xl="8"
      >
        <v-row
          justify="space-between"
          align="center"
        >
          <v-col
            cols="7"
            sm="6"
          >
            <v-autocomplete
              v-model="autocompleteVoyage.selectedVoyage"
              :items="autocompleteVoyage.items"
              label="Rechercher par voyage"
              density="comfortable"
              clearable
              class="text-center mt-4"
            >
              <template #prepend-inner>
                <v-icon icon>
                  {{ mdiMagnify }}
                </v-icon>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col
            cols="5"
            sm="4"
          >
            <v-select
              v-model="reviewFilter.selectedFilter"
              :item-title="reviewFilter.items"
              :item-value="reviewFilter.items"
              density="comfortable"
              solo
              label="Trier"
              hide-details
              :prepend-inner-icon="mdiFilterVariant"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row
      v-if="paginatedItems.length > 0"
      justify="center"
    >
      <v-col
        v-for="review, index in paginatedItems"
        :key="index"
        cols="12"
      >
        <ReviewCard
          :review="review"
          :max-note="maxNote"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiStar, mdiMagnify, mdiFilterVariant } from '@mdi/js'

const maxNote = ref(5)
const reviewFilter = ref({
  selectedFilter: 'relevant',
  items: [
    { title: 'Les plus pertinents', value: 'relevant' },
    { title: 'Les plus récents', value: 'recent' },
    { title: 'Les plus favorables', value: 'best' },
    { title: 'Les moins favorables', value: 'worst' },
  ],
})
const autocompleteVoyage = ref({
  selectedVoyage: null,
  items: [],
})

const pagination = ref({
  currentPage: 1,
  itemsPerPage: 3,
})

const { data: reviews } = await useAsyncData(() => {
  return queryCollection('avis').all()
})

const displayedReviews = computed(() => {
  return reviews.value.filter(a => a.isDisplayed)
})

const voyagesFromReviews = computed(() => {
  const voyagesSet = new Set()

  reviews.value.forEach((review) => {
    if (review.voyageTitle) {
      voyagesSet.add(review.voyageTitle)
    }
  })

  return Array.from(voyagesSet)
})
autocompleteVoyage.value.items = [...voyagesFromReviews.value]

const averageNote = computed(() => {
  return displayedReviews.value.reduce((acc, cur) => {
    return acc + cur.note
  }, 0) / displayedReviews.value.length
})

const filteredReviews = computed (() => {
  let filteredReviews = [...displayedReviews.value]

  if (autocompleteVoyage.value.selectedVoyage) {
    filteredReviews = filteredReviews.filter(review => review.voyageTitle === autocompleteVoyage.value.selectedVoyage)
  }
  return filteredReviews
})

const sortedReviews = computed(() => {
  let sortedReviews = [...filteredReviews.value]

  if (reviewFilter.value.selectedFilter === 'recent') {
    sortedReviews = [...filteredReviews.value]
    return sortedReviews.sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    })
  }
  else if (reviewFilter.value.selectedFilter === 'best') {
    sortedReviews = [...filteredReviews].filter(review => review.note >= 4)
    return sortedReviews.sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    })
  }
  else if (reviewFilter.value.selectedFilter === 'worst') {
    sortedReviews = [...filteredReviews.value]
    return sortedReviews.sort((a, b) => {
      return a.note - b.note
    })
  }
  else {
    return sortedReviews.sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    }).filter(review => review.note >= 3 && review.text.length >= 70)
  }
})

const paginatedItems = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage
  const end = pagination.value.currentPage * pagination.value.itemsPerPage
  return sortedReviews.value.slice(start, end)
})
</script>
