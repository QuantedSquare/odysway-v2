<template>
  <v-container
    ref="scroll-target"
    :fluid="width >= 1440"
    class="py-0 my-4 my-md-8"
  >
    <v-row justify="center">
      <v-col
        cols="12"
        class="d-flex flex-column align-center justify-center my-4 my-md-8"
      >
        <h3
          class="d-flex text-center text-h5 text-lg-h4 pb-2"
        >
          <v-icon color="orange-lighten-1">
            {{ mdiStar }}
          </v-icon>
          <span>
            {{ averageNote.toFixed(1) }}/{{ maxNote }}
            <slot
              name="first-phrase"
              mdc-unwrap="p"
            />
            {{ displayedReviews.length }} avis
          </span>
        </h3>
        <p class="text-center text-body-1">
          <slot
            name="second-phrase"
            mdc-unwrap="p"
          />
        </p>
      </v-col>
    </v-row>
    <v-row
      justify="center"
    >
      <v-col
        cols="12"
        xl="8"
      >
        <v-row
          align="center"
        >
          <v-col
            cols="12"
            sm="6"
          >
            <ClientOnly>
              <v-autocomplete
                v-model="autocompleteVoyage.selectedVoyage"
                :items="autocompleteVoyage.items"
                label="Rechercher par voyage"
                density="comfortable"
                clearable
                hide-details
                class="text-center mt-0"
              >
                <template #prepend-inner>
                  <v-icon icon>
                    {{ mdiMagnify }}
                  </v-icon>
                </template>
              </v-autocomplete>
            </ClientOnly>
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <ClientOnly>
              <v-select
                v-model="reviewFilter.selectedFilter"
                :items="reviewFilter.items"
                density="comfortable"
                label="Trier"
                hide-details
                :prepend-inner-icon="mdiFilterVariant"
              />
            </ClientOnly>
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
        <ClientOnly>
          <ReviewCard
            :review="review"
            :max-note="maxNote"
          />
        </ClientOnly>
      </v-col>
      <v-col v-if="nbPages > 1">
        <v-pagination
          v-model="pagination.currentPage"
          :length="nbPages"
          :total-visible="width > 600 ? 5 : 3"
          variant="flat"
          :size="width > 600 ? 'default' : 'small'"
          rounded="circle"
          active-color="primary"
          elevation="3"
          class="my-4"
          @click="goTo(scrollTarget, { offset: -50 })"
          @next="pagination.currentPage = pagination.currentPage++"
          @prev="pagination.currentPage = pagination.currentPage-- "
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiStar, mdiMagnify, mdiFilterVariant } from '@mdi/js'
import { useGoTo, useDisplay } from 'vuetify'

const { width } = useDisplay()

const reviewsQuery = `
  *[_type == "review"]{
    _id,
    author,
    authorAge,
    date,
    photo,
    rating,
    text,
    voyage->{
      _id,
      title,
      slug
    }
  }
`

const { data: reviews } = await useSanityQuery(reviewsQuery, {}, {
  key: 'reviews-avis-voyageurs',
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
})

const scrollTarget = useTemplateRef('scroll-target')

const goTo = useGoTo()

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

const displayedReviews = computed(() => {
  return reviews.value.map((a) => {
    return {
      ...a,
      date: a.date ? a.date : new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
      rating: a.rating ? a.rating : 5,
    }
  }).filter(a => !a.text.includes('Lorem'))
})

const averageNote = computed(() => {
  return displayedReviews.value.length
    ? displayedReviews.value.reduce((acc, cur) => acc + cur.rating, 0) / displayedReviews.value.length
    : 0
})

const voyagesFromReviews = computed(() => {
  const voyagesSet = new Set()

  displayedReviews.value.forEach((review) => {
    if (review.voyageTitle) {
      voyagesSet.add(review.voyageTitle)
    }
  })

  return Array.from(voyagesSet)
})

autocompleteVoyage.value.items = [...voyagesFromReviews.value]

const filteredReviews = computed (() => {
  let filteredReviews = [...displayedReviews.value]

  if (autocompleteVoyage.value.selectedVoyage) {
    filteredReviews = filteredReviews.filter(review => review.voyageTitle === autocompleteVoyage.value.selectedVoyage)
  }
  return filteredReviews
})

const sortedReviews = computed(() => {
  if (reviewFilter.value.selectedFilter === 'recent') {
    return [...filteredReviews.value].sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    })
  }
  else if (reviewFilter.value.selectedFilter === 'best') {
    return [...filteredReviews.value].filter(review => review.rating >= 4).sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    })
  }
  else if (reviewFilter.value.selectedFilter === 'worst') {
    return [...filteredReviews.value].sort((a, b) => {
      return a.rating - b.rating
    })
  }
  else {
    return [...filteredReviews.value].sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    }).filter(review => review.rating >= 3 && review.text.length >= 70)
  }
})

const paginatedItems = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage
  const end = pagination.value.currentPage * pagination.value.itemsPerPage
  return sortedReviews.value.slice(start, end)
})

const nbPages = computed(() => {
  return Math.ceil(sortedReviews.value.length / pagination.value.itemsPerPage)
})

watch(() => reviewFilter.value.selectedFilter, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    pagination.value.currentPage = 1
  }
})

watch(() => autocompleteVoyage.value.selectedVoyage, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    pagination.value.currentPage = 1
  }
})
</script>
