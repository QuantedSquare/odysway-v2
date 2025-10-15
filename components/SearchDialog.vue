<template>
  <v-dialog
    transition="dialog-bottom-transition"
    class="blur"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        :size="smAndDown ? 24 : 36"
        icon
        class="border-circle stronger-hover bg-white"
      >
        <v-img
          :src="img('/icons/Search.svg', { format: 'webp', quality: 70, width: 320, height: 320 })"
          alt="Search icon"
          :width="smAndDown ? 16 : 20"
        />
      </v-btn>
    </template>

    <template #default="{ isActive }">
      <v-sheet
        class="pa-10 rounded-sm d-flex flex-column mx-auto custom-size"
        position="relative"
      >
        <v-btn
          :icon="mdiClose"
          size="36"
          rounded="circle"
          position="absolute"
          class="right-0 top-0 mr-3 mt-3"
          @click="isActive.value = false"
        />
        <v-row
          no-gutters
          class="flex-grow-0 mb-4"
        >
          <v-col
            class="text-h5 text-md-h3 text-primary d-flex flex-column ga-6"
          >
            <div>{{ searchText ? nbVoyageIdeas : 'Commencez votre recherche !' }}</div>
            <div>
              <v-text-field
                v-model="searchText"
                variant="outlined"
                placeholder="Saisir une envie de voyage..."
                rounded="sm"
                hide-details
                @input="debouncedHandleSearch"
              >
                <template #prepend-inner>
                  <v-img
                    :src="img('/icons/Search.svg', { format: 'webp', quality: 70, width: 320, height: 320 })"
                    alt="Search icon"
                    width="24"
                    height="24"
                  />
                </template>
              </v-text-field>
            </div>
          </v-col>
        </v-row>

        <v-row class="overflow-auto flex-grow-1">
          <v-col>
            <div
              v-if="!loading && destinations && destinations.length > 0"
              class="d-flex ga-3 flex-wrap"
            >
              <v-chip
                v-for="(travel, index) in destinations"
                :key="index"
                variant="outlined"
                class="pb-1"
                @click="navigate(travel); isActive.value = false"
              >
                {{ travel.title }}
              </v-chip>
            </div>
            <div
              v-else-if="!loading && searchText && destinations.length === 0"
              class="text-center text-grey"
            >
              Aucun résultat trouvé pour votre recherche.
            </div>
          </v-col>
        </v-row>
      </v-sheet>
    </template>
  </v-dialog>
</template>

<script setup>
import { mdiClose } from '@mdi/js'
import { ref, computed } from 'vue'
import _ from 'lodash'
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'
import { useTravelsSearch } from '~/composables/useTravelsSearch'

const img = useImage()
const searchText = ref('') // TODO use route params by default

const { smAndDown } = useDisplay()
const { destinations, loading, handleSearch } = useTravelsSearch()

const debouncedHandleSearch = _.debounce(() => {
  handleSearch(searchText.value)
}, 200)

onMounted(() => {
  handleSearch(searchText.value)
})

const nbVoyageIdeas = computed(() => {
  const count = destinations.value?.length
  return count > 1 ? `${count} idées de voyage` : `${count} idée de voyage`
})

function navigate(destination) {
  const page = destination.dataSource === 'destinations' || destination.dataSource === 'regions'
    ? `/search?destination=${destination.slug}`
    : `/voyages/${destination.slug}`
  navigateTo(page)
}
</script>

<style scoped>
.border-circle {
  border-radius: 50% !important;
}
.blur {
  backdrop-filter: blur(10px);
}

.stronger-hover:hover{
  background-color: #E1E5E7;
}
.custom-size {
  width: 900px !important;
  min-height: 500px !important;
  max-height: 500px !important;
}
@media screen and (max-width: 600px) {
  .custom-size {
    width: 100% !important;
  }
}
@media screen and (max-width: 960px) {
  .custom-size {
    width: 90% !important;
  }
}
@media screen and (min-width: 1280px) {
  .custom-size {
    max-width: 900px !important;
  }
}
::-webkit-scrollbar {
  width: 5px;
}
/* Track */
::-webkit-scrollbar-track {
  border: 7px solid white;
  background: #C5C7C9;
  height: 10px;
  border-radius: 9px;
}
/* Handle */
::-webkit-scrollbar-thumb {
  border: 6px solid rgba(var(--v-theme-primary));
  border-radius: 9px;
  background-clip: content-box;
  height: 10px;
  width: 10px;
}
</style>
