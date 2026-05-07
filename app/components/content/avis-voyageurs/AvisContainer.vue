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
          class="d-flex align-center text-center text-h5 text-lg-h4 pb-2"
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
            {{ sortedReviews.length }} avis
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
                v-model="autocompleteVoyage.selectedVoyageId"
                v-model:search="autocompleteVoyage.searchText"
                :items="voyagesFromReviews"
                item-title="title"
                item-value="id"
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
        v-for="review in paginatedItems"
        :key="review._id"
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
          @update:model-value="goTo(scrollTarget, { offset: -50 })"
        />
      </v-col>
    </v-row>
    <v-row
      v-else
      justify="center"
    >
      <v-col
        cols="12"
        class="text-center text-body-1 my-6"
      >
        Aucun avis ne correspond à votre recherche.
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

const { data: reviews } = await useSanityQuery(reviewsQuery)

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
  selectedVoyageId: null,
  searchText: '',
})

const pagination = ref({
  currentPage: 1,
  itemsPerPage: 3,
})

const displayedReviews = computed(() => {
  // Avoid duplicate reviews if the Sanity query result contains duplicates.
  const uniqueById = new Map()

  ;(reviews.value || []).forEach((r) => {
    if (!r?._id || uniqueById.has(r._id)) return
    uniqueById.set(r._id, r)
  })

  const normalizeText = s => (typeof s === 'string' ? s : '')

  return Array.from(uniqueById.values())
    .map((r) => {
      const voyageTitle = r.voyageTitle || r.voyage?.title || ''
      const voyageSlug = r.voyageSlug || r.voyage?.slug || ''
      const voyageId = r.voyage?._id || r.voyage?._ref || null

      return {
        ...r,
        text: normalizeText(r.text),
        author: normalizeText(r.author),
        authorAge: normalizeText(r.authorAge),
        date: r.date ? r.date : new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
        rating: typeof r.rating === 'number' ? r.rating : 5,
        voyageTitle,
        voyageSlug,
        voyageId,
      }
    })
    .filter(r => !r.text.includes('Lorem'))
})

const averageNote = computed(() => {
  return sortedReviews.value.length
    ? sortedReviews.value.reduce((acc, cur) => acc + cur.rating, 0) / sortedReviews.value.length
    : 0
})

const voyagesFromReviews = computed(() => {
  // Deduplicate voyages by id (not by object identity).
  const voyagesById = new Map()

  displayedReviews.value.forEach((review) => {
    if (!review?.voyageId) return
    if (voyagesById.has(review.voyageId)) return
    voyagesById.set(review.voyageId, {
      id: review.voyageId,
      title: review.voyageTitle,
      slug: review.voyageSlug,
    })
  })

  return Array.from(voyagesById.values())
})

const filteredReviews = computed(() => {
  let filteredReviews = [...displayedReviews.value]

  const selectedVoyageId = autocompleteVoyage.value.selectedVoyageId

  if (selectedVoyageId) {
    filteredReviews = filteredReviews.filter(review => review.voyageId === selectedVoyageId)
  }
  else if (autocompleteVoyage.value.searchText.trim()) {
    const normalize = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const q = normalize(autocompleteVoyage.value.searchText.trim())

    filteredReviews = filteredReviews.filter(review => normalize(review.voyageTitle).includes(q))
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
    }).filter(review => review.rating >= 3 && (review.text || '').length >= 70)
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

watch(() => autocompleteVoyage.value.selectedVoyageId, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    pagination.value.currentPage = 1
  }
})

watch(() => autocompleteVoyage.value.searchText, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    pagination.value.currentPage = 1
  }
})
</script>
