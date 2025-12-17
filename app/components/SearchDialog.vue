<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="900"
    class="search-dialog"
    :fullscreen="true"
  >
    <template #activator="{ props: activatorProps }">
      <slot
        name="activator"
        :props="activatorProps"
      >
        <v-btn
          v-bind="activatorProps"
          :size="36"
          icon
          variant="outlined"
          class="search-trigger-btn"
        >
          <v-img
            :src="img('/icons/Search.svg', { format: 'webp', quality: 100, width: 20, height: 20 })"
            alt="Search icon"
            width="20"
            height="20"
            fetchpriority="high"
          />
        </v-btn>
      </slot>
    </template>

    <v-card
      class="search-card "
      elevation="24"
    >
      <!-- Header -->
      <v-card-title class="search-header pa-6 pb-md-4 pb-0">
        <div class="d-flex align-center justify-space-between">
          <div class="search-title">
            {{ searchText ? nbVoyageIdeas : (searchDialogField?.searchDialogTitle || 'Rechercher un voyage') }}
          </div>
          <v-btn
            :icon="mdiClose"
            variant="text"
            size="small"
            class="close-btn"
            color="white"
            @click="closeDialog"
          />
        </div>
      </v-card-title>

      <!-- Search Input -->
      <v-card-text class="px-6 pt-2 pb-0 card-text-height">
        <v-text-field
          v-model="searchText"
          :placeholder="searchDialogField?.searchDialogPlaceholder || 'Saisir une envie de voyage...'"
          density="comfortable"
          rounded="xl"
          hide-details
          autofocus
          class="search-input"
          @input="debouncedHandleSearch"
        >
          <template #prepend-inner>
            <v-icon
              :icon="mdiMagnify"
              size="20"
              class="search-icon"
            />
          </template>
        </v-text-field>

        <!-- Quick filters -->
        <div
          v-if="searchDialogField?.searchDialogBtnList?.length"
          class="quick-filters"
        >
          <div class="chip-row">
            <v-chip
              v-for="btn in searchDialogField.searchDialogBtnList"
              :key="btn.text"
              :to="btn.link"
              size="small"
              class="filter-chip"
              color="white"
              variant="outlined"
              @click="closeDialog"
            >
              <span class="chip-text">{{ btn.text }}</span>
            </v-chip>
          </div>
        </div>
      </v-card-text>

      <!-- Results Area -->
      <v-card-text class="results-area px-6 pb-6 text-white pt-0">
        <!-- Empty state -->
        <div
          v-if="!searchText && !loading"
          class="empty-state"
        >
          <v-icon
            :icon="mdiMagnify"
            size="64"
            class="empty-icon mb-4"
          />
          <div class="empty-title mb-2">
            Recherchez votre prochaine aventure
          </div>
          <div class="empty-subtitle">
            Saisissez une destination, un type de voyage ou une expérience...
          </div>
        </div>

        <!-- Loading state -->
        <div
          v-else-if="loading && searchText"
          class="loading-state"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
          />
          <div class="loading-text mt-4">
            Recherche en cours...
          </div>
        </div>

        <!-- Results -->
        <div
          v-else-if="!loading && destinations && destinations.length > 0"
          class="results-container"
        >
          <!-- Voyages section -->
          <div
            v-if="voyageResults.length > 0"
            class="results-section"
          >
            <div class="section-title">
              Voyages
            </div>
            <div class="results-grid">
              <div
                v-for="(voyage, index) in voyageResults"
                :key="index"
                class="result-card"
                @click="navigate(voyage, index + 1)"
              >
                <div class="card-image-wrapper">
                  <img
                    v-if="voyage.image"
                    :src="voyage.image"
                    :alt="voyage.title"
                    class="card-image"
                  >
                  <div
                    v-else
                    class="card-placeholder"
                  >
                    <v-icon
                      :icon="mdiImageOutline"
                      size="40"
                      color="white"
                    />
                  </div>
                  <div class="card-gradient" />
                  <div class="card-title">
                    {{ voyage.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Destinations & Regions section -->
          <div
            v-if="otherResults.length > 0"
            class="results-section"
          >
            <div class="section-title">
              Destinations & Régions
            </div>
            <div class="results-grid">
              <div
                v-for="(destination, index) in otherResults"
                :key="index"
                class="result-card"
                @click="navigate(destination, index + 1 + voyageResults.length)"
              >
                <div class="card-image-wrapper">
                  <img
                    v-if="destination.image"
                    :src="destination.image"
                    :alt="destination.title"
                    class="card-image"
                  >
                  <div
                    v-else
                    class="card-placeholder"
                  >
                    <v-icon
                      :icon="mdiMapMarkerOutline"
                      size="40"
                      color="white"
                    />
                  </div>
                  <div class="card-gradient" />
                  <!-- Voyage count badge -->
                  <div
                    v-if="destination.voyageCount"
                    class="voyage-badge"
                  >
                    {{ destination.voyageCount }} {{ destination.voyageCount === 1 ? 'voyage' : 'voyages' }}
                  </div>
                  <div class="card-title">
                    {{ destination.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No results state -->
        <div
          v-else-if="!loading && searchText && destinations.length === 0"
          class="no-results-state text-white text-center"
        >
          <v-icon
            :icon="mdiMagnifyClose"
            size="64"
            color="white"
            class="no-results-icon mb-4"
          />
          <div class="no-results-title mb-2">
            Aucun résultat trouvé
          </div>
          <div class="no-results-subtitle">
            Essayez avec d'autres mots-clés ou une destination différente
          </div>
        </div>
      </v-card-text>

      <!-- Algolia Branding -->
      <v-card-actions class="d-flex justify-end align-center px-6 pb-4 pt-2 custom-bg-action">
        <span class="text-caption text-medium-emphasis mr-2">Powered by</span>
        <NuxtLink
          to="https://www.algolia.com/"
          target="_blank"
        >
          <img
            src="/icons/Algolia-logo-blue.svg"
            alt="Algolia"
            height="16"
            width="80"
          >
        </NuxtLink>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { mdiClose, mdiMapMarkerOutline, mdiImageOutline, mdiMagnifyClose, mdiMagnify } from '@mdi/js'
import { ref, computed, onMounted } from 'vue'
import _ from 'lodash'
import aa from 'search-insights'

import { useImage } from '#imports'
import { useTravelsSearch } from '~/composables/useTravelsSearch'

// Initialize Algolia Insights
onMounted(() => {
  const config = useRuntimeConfig()
  aa('init', {
    appId: config.public.algolia.applicationId,
    apiKey: config.public.algolia.apiKey,
    useCookie: true,
  })
})

const sanity = useSanity()
const img = useImage()

const dialogOpen = ref(false)
const searchText = ref(null)
const cookie = useCookie('odysway_employee_optout')

const searchDialogFieldQuery = groq`*[_type == "search"][0]{
  searchDialogTitle,
  searchDialogPlaceholder,
  searchDialogBtnList
}`

const { data: searchDialogField } = await useAsyncData('search-dialog-field', () =>
  sanity.fetch(searchDialogFieldQuery),
)

const { destinations, loading, handleEmbededSearch } = useTravelsSearch()

const debouncedHandleSearch = _.debounce(() => {
  handleEmbededSearch(searchText.value, cookie.value === 1)
}, 200)

const nbVoyageIdeas = computed(() => {
  const count = destinations.value?.length
  return count > 1 ? `${count} idées de voyage` : `${count} idée de voyage`
})

const voyageResults = computed(() => {
  return destinations.value?.filter(d => d.dataSource === 'voyages') || []
})

const otherResults = computed(() => {
  return destinations.value?.filter(d => d.dataSource === 'destinations' || d.dataSource === 'regions')
    .sort((a, b) => (b.voyageCount || 0) - (a.voyageCount || 0)) || []
})

function navigate(destination, position = 1) {
  // Track click with Algolia Insights
  if (destination.objectID && destination.queryID && cookie.value !== 1) {
    aa('clickedObjectIDsAfterSearch', {
      index: 'odysway',
      eventName: 'Search Result Clicked',
      queryID: destination.queryID,
      objectIDs: [destination.objectID],
      positions: [position],

    })
  }

  const page = destination.dataSource === 'destinations' || destination.dataSource === 'regions'
    ? `/voyages?destination=${destination.slug}`
    : `/voyages/${destination.slug}`
  navigateTo(page)
  closeDialog()
}

function closeDialog() {
  dialogOpen.value = false
  searchText.value = null
  destinations.value = []
}
</script>

<style scoped>
.custom-bg-action{
  background-color: rgba(255, 255, 255, 0.4)!important;
  opacity: 0.8!important;
}
/* Trigger Button */
.search-trigger-btn {
  border-radius: 50% !important;
  /* background-color: white; */
  transition: all 0.2s ease;
}

.search-trigger-btn:hover {
  background-color: #7e94b484;
  transform: scale(1.05);
}

/* Dialog Card */
.search-card {
  border-radius: 0px !important;
  background-color: rgba(184, 182, 182, 0.5)!important;
  backdrop-filter: blur(10px)!important;
  max-height: 85vh;
  display: flex;

}
@media (max-width: 600px) {
  .search-card {
    max-height: 100vh!important;
  }
}
.search-title {
  font-size: 24px;
  font-weight: 600;
  /* color: rgb(var(--v-theme-primary)); */
  color: rgb(var(--v-theme-white));
}

.close-btn {
  opacity: 1;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

.card-text-height {
  max-height: fit-content;
}

/* Search Input */
.search-input :deep(.v-field) {
  border-radius: 12px;
  background-color: #f8f9fa;
  border-color: transparent;
}

.search-input :deep(.v-field:hover) {
  background-color: #f0f1f3;
}

.search-input :deep(.v-field--focused) {
  background-color: white;
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.1);
}

.search-icon {
  opacity: 0.5;
}

/* Quick Filter Chips */
.quick-filters {
  display: flex;
  /* overflow-x: auto; */
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(var(--v-theme-white), 0.2);
  padding-bottom: 24px;
  padding-top: 24px;
}

@media (max-width: 600px) {
  .quick-filters {
    padding-bottom: 12px;
    padding-top: 12px;

  }
  .results-section {
    padding-top: 12px!important;
    /* margin-bottom: 0px;
    padding-top: 12px; */
  }
}
.chip-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  /* overflow-x: auto; */
  /* scrollbar-width: thin; */
  padding: 4px 2px;
}
.chip-row::-webkit-scrollbar {
  height: 6px;
}
.chip-row::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
}

.filter-chip {
  background: linear-gradient(135deg, rgba(white, 0.08) 0%, rgba(white, 0.12) 100%) !important;
  /* border: 1.5px solid rgba(var(--v-theme-primary-light-4), 0.2) !important; */
  border-radius: 14px !important;
  padding: 6px 10px !important;
  height: 30px !important;
  min-height: 30px !important;
  flex: 0 0 auto;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.filter-chip::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.filter-chip:hover::before {
  left: 100%;
}

.filter-chip:hover {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.15) 0%, rgba(var(--v-theme-primary), 0.25) 100%) !important;
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  transform: translateY(-2px);
  /* box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2); */
  text-decoration: none;
}

.filter-chip:active {
  transform: translateY(0);
}

.chip-text {
  color: white;
  font-weight: 600;
  font-size: 12px;
  position: relative;
  z-index: 1;
}

/* Results Area */
.results-area {
  overflow-y: auto;
}

/* Scrollbar */
.results-area::-webkit-scrollbar {
  width: 6px;
}

.results-area::-webkit-scrollbar-track {
  background: transparent;
}

.results-area::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.results-area::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  animation: fadeIn 0.4s ease;
}

.empty-icon {
  opacity: 0.3;
  color: rgb(var(--v-theme-white));
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: rgb(var(--v-theme-white));
}

.empty-subtitle {
  font-size: 14px;
  color: rgb(var(--v-theme-white));
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-text {
  font-size: 14px;
  color: #666;
}

/* No Results State */
.no-results-state {
  text-align: center;
  padding: 80px 20px;
  animation: fadeIn 0.4s ease;
}

.no-results-icon {
  opacity: 0.5;

}

.no-results-title {
  font-size: 20px;
  font-weight: 600;

}

.no-results-subtitle {
  font-size: 14px;

}

/* Results Container */
.results-container {
  animation: fadeIn 0.3s ease;
}

.results-section {
  animation: slideUp 0.3s ease;
  padding-top: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: rgb(var(--v-theme-white));
  margin-bottom: 10px;
}

/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

@media (max-width: 600px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}

/* Result Card */
.result-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 66.67%;
  /* 3:2 aspect ratio */
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.result-card:hover .card-image {
  transform: scale(1.08);
}

.card-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.6) 0%, rgba(var(--v-theme-primary), 0.8) 100%);
}

.card-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 40%, rgba(0, 0, 0, 0) 100%);
  pointer-events: none;
}

.card-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  line-height: 1.3;
}

/* Voyage Count Badge */
.voyage-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  color: rgb(var(--v-theme-primary));
  font-size: 11px;
  font-weight: 700;
  border-radius: 20px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .search-title {
    font-size: 20px;
  }

  .empty-state,
  .loading-state,
  .no-results-state {
    padding: 60px 20px;
  }

  .results-area {
    max-height: calc(85vh - 180px);
  }

  .card-image-wrapper {
    padding-top: 30.25%;
  }
}
</style>
