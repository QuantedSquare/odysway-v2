<template>
  <v-container
    ref="searchField"
    class="search-field-container py-0"
  >
    <div

      class="rounded-md bg-white pa-4 pb-0  search-field-min-height"
      :class="{ 'search-field-shadow': !showDestinationsCarousel }"
    >
      <ClientOnly>
        <v-row align="center">
          <v-col
            cols="12"
            md="3"
            class="relative z-index-parent"
          >
            <v-text-field
              v-model="search"
              class="z-index-2003"
              label="Destinations"
              clearable
              hide-details
              :readonly="false"
              @click="showDestinationsCarousel = !showDestinationsCarousel"
              @click:clear="clearDestination"
              @keydown.enter.prevent
            >
              <template #prepend-inner>
                <v-img
                  :src="img('/icons/two-pin-marker.svg', { format: 'webp', quality: 70, width: 640 })"
                  alt="Pin marker"
                  width="24"
                  height="24"
                />
              </template>
              <template #append-inner>
                <v-icon
                  :class="{ 'rotate-arrow': showDestinationsCarousel }"
                  transition="rotate-transition"
                >
                  {{ mdiMenuDown }}
                </v-icon>
              </template>
            </v-text-field>
            <v-overlay
              activator="parent"
              location-strategy="connected"
              scroll-strategy="close"
              class="z-index-responsive"
              @click:outside="showDestinationsCarousel = false"
            >
              <div
                class="destination-carousel rounded-md bg-white pa-4 mt-2 "
                :style="{ '--carousel-width': widthValue }"
              >
                <v-slide-group
                  v-if="filteredDestinations.length > 0"
                  show-arrows
                >
                  <v-slide-group-item
                    v-for="item in filteredDestinations"
                    :key="item.value"
                  >
                    <div
                      class="carousel-item"
                      @click="selectDestination(item)"
                    >
                      <v-lazy
                        :min-height="120"
                        :options="{ threshold: 0.5 }"
                        transition="fade-transition"
                      >
                        <v-img
                          :src="img(item.image.src, { format: 'webp', quality: 70, width: 1024 })"
                          :lazy-src="img(item.image.src, { format: 'webp', quality: 10, width: 1024 })"
                          :srcset="`${img(item.image.src, { format: 'webp', quality: 70, width: 1024 })} 1024w, ${img(item.image.src, { format: 'webp', quality: 70, width: 1536 })} 1536w`"
                          sizes="(max-width: 600px) 480px, 1024px"
                          width="120"
                          :alt="item.title"
                          height="120"
                          cover
                          rounded="lg"
                          class="d-flex align-end pb-5 justify-center text-center ml-1a"
                        >
                          <div class="text-white text-shadow font-weight-bold text-body-1">
                            {{ item.title }}
                          </div>
                        </v-img>
                      </v-lazy>
                    </div>
                  </v-slide-group-item>
                </v-slide-group>
                <div
                  v-else
                  class="text-center text-body-1 no-data-found"
                >
                  Aucune destination trouvée
                </div>
              </div>
            </v-overlay>
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-select
              v-model="travelTypeChoice"
              :items="travelTypes"
              hide-details
              label="Type de voyage"
              clearable
            >
              <template #prepend-inner>
                <v-img
                  :src="img('/icons/business-team.svg', { format: 'webp', quality: 70, width: 640 })"
                  alt="Team icon"
                  width="24"
                  height="24"
                />
              </template>
            </v-select>
          </v-col>
          <v-col
            :cols="12"
            md="3"
          >
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              location="end"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  :value="formattedDate"
                  readonly
                  class="font-weight-bold text-primary"
                  hide-details
                >
                  <template #prepend-inner>
                    <v-img
                      :src="img('/icons/calendar.svg', { format: 'webp', quality: 70, width: 640 })"
                      alt="Calendar icon"
                      width="24"
                      height="24"
                    />
                  </template>
                </v-text-field>
              </template>

              <v-card
                min-width="300"
                elevation="6"
              >
                <v-locale-provider locale="fr">
                  <v-date-picker
                    v-model="date"
                    multiple="range"
                    width="400"
                    :min="new Date()"
                    show-adjacent-months
                    @update:model-value="() => { date.length > 1 ? dateMenu = false : '' } "
                  />
                </v-locale-provider>
              </v-card>
            </v-menu>
          </v-col>
          <v-col
            cols="12"
            md="3"
            class=" h-100"
          >
            <v-btn
              height="56"
              block
              :loading="status === 'pending'"
              color="secondary"
              class="text-none text-body-1"
              @click="searchFn"
            >
              Découvrir les voyages
            </v-btn>
          </v-col>
        </v-row>
      </ClientOnly>
    </div>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import { ref, computed } from 'vue'
import { mdiMenuDown } from '@mdi/js'
import { useElementSize } from '@vueuse/core'
// import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const img = useImage()
const router = useRouter()
const route = useRoute()
const dateMenu = ref(false)
const { gtag } = useGtag()
// Replace individual refs with useState
const date = useState('searchDate', () => [])
const travelTypeChoice = useState('searchTravelType', () => null)
const destinationChoice = useState('searchDestination', () => route.query.destination || null)
const showDestinationsCarousel = ref(false)
const search = ref('')

const searchFieldRef = useTemplateRef('searchField')
const { width: searchFieldWidth } = useElementSize(searchFieldRef)
// const { width } = useDisplay()
watch(showDestinationsCarousel, (newVal) => {
  console.log('searchFieldWidth', searchFieldWidth.value)
})

const { data: destinations, status } = useAsyncData('destinations', () => {
  return queryCollection('destinations').select('titre', 'slug', 'metaDescription', 'published', 'regions', 'image', 'stem').where('published', '=', true).all()
})
const destinationsList = computed(() => {
  return destinations.value?.map((d) => {
    return {
      title: d.titre,
      value: d.stem.split('/')[1],
      image: d.image,
      group: d.regions.map(r => r.nom).join(', '),
    }
  })
})

const filteredDestinations = computed(() => {
  if (!search.value) return destinationsList.value
  return destinationsList.value?.filter(item =>
    item.title.toLowerCase().includes(search.value.toLowerCase()),
  )
})
const widthValue = computed(() => {
  return `${searchFieldWidth.value}px`
})
const travelTypes = [
  'Voyage individuel', 'Voyage en groupe',
]

const formattedDate = computed(() => {
  return date.value ? dayjs(date.value[0]).format('DD/MM') + ' - ' + dayjs(date.value[date.value.length - 1]).format('DD/MM') : ''
})

function searchFn() {
  const query = {}
  if (destinationChoice.value) {
    query.destination = destinationChoice.value
  }
  if (travelTypeChoice.value) {
    query.travelType = travelTypeChoice.value
  }
  if (date.value.length > 0) {
    query.from = `${dayjs(date.value[0]).format('YYYY-MM-DD')}`
    query.to = `${dayjs(date.value[date.value.length - 1]).format('YYYY-MM-DD')}`
  }

  gtag('event', 'search', { eventAction: 'Click', destination: `${destinationChoice.value}`, travelType: `${travelTypeChoice.value}`, from: `${date.value[0]}`, to: `${date.value[1]}` })

  router.push({
    path: '/search',
    query,
  })
}

function selectDestination(item) {
  destinationChoice.value = item.value
  search.value = item.title
  showDestinationsCarousel.value = false
}

function clearDestination() {
  destinationChoice.value = null
  search.value = ''
}
</script>

<style scoped>
:deep(.v-icon__svg) {
  color: rgb(var(--v-theme-primary)) !important;
}
:deep(.v-field__input) {
  color: rgb(var(--v-theme-primary)) !important;
}
.search-field-container {
  max-width: 1070px;
  position: relative;
  z-index: 2001!important;
}

.search-field-shadow {
  box-shadow: 5px 5px 100px 0px rgba(43, 76, 82, 0.5);
}
.search-field-min-height {
  min-height: 88px!important;
  box-sizing: border-box;

  /* box-shadow: 5px 5px 100px 0px rgba(43, 76, 82, 0.5); */
}
.destination-carousel {
  box-sizing: border-box;
  max-width: var(--carousel-width, 0);
  min-width: var(--carousel-width, 0);
  margin-left:-3px;
  box-shadow: 5px 5px 100px 0px rgba(43, 76, 82, 0.15);
  z-index: 2002!important;

}

.carousel-item {
  cursor: pointer;
  margin-right: 16px;
  transition: transform 0.2s;
}
.carousel-item:hover {
  transform: scale(1.05);
}
.rotate-arrow {
  transform: rotate(180deg);
  transition: transform 0.2s;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.no-data-found{
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.z-index-responsive{
  z-index: 0!important;
}
.relative {
  position: relative;
}
.z-index-parent {
  position: relative;
}
.z-index-2003 {
  z-index: 2003 !important;
  position: relative;
}
@media screen and (max-width: 960px) {
  .z-index-2003 {
    z-index: 2003 !important;
    position: relative;
  }
  .z-index-parent {
    z-index: 2001 !important;
    position: relative;
  }
  .z-index-responsive {
    z-index: 2000 !important;
  }
}
</style>
