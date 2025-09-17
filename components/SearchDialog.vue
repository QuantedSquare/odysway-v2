<template>
  <v-dialog
    transition="dialog-bottom-transition"
    class="blur"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        variant="outlined"
        size="small"
        icon
        class="border-circle"
      >
        <v-img
          :src="img('/icons/Search.svg', { format: 'webp', quality: 70, width: 640, height: 640 })"
          alt="Search icon"
          width="24"
          height="24"
        />
      </v-btn>
    </template>

    <template #default="{ isActive }">
      <v-container
        class="bg-white rounded-sm d-flex flex-column"
        min-height="300"
        max-height="500"
        max-width="900"
      >
        <v-row justify="center">
          <v-col
            cols="12"
            class="d-flex justify-end"
          >
            <v-btn
              :icon="mdiClose"
              size="36"
              rounded="circle"
              @click="isActive.value = false"
            />
          </v-col>
          <v-col
            cols="10"
            class="text-h5 text-md-h3 text-primary"
          >
            {{ nbVoyageIdeas }}
          </v-col>
          <v-col cols="10">
            <v-text-field
              v-model="searchText"
              placeholder="Saisir une envie de voyage..."
              rounded="sm"
              hide-details
              @input="getDestinations()"
            >
              <template #prepend-inner>
                <v-img
                  :src="img('/icons/Search.svg', { format: 'webp', quality: 70, width: 320, height: 320 })"
                  alt="Team icon"
                  width="24"
                  height="24"
                />
              </template>
            </v-text-field>
          </v-col>
        </v-row>
        <v-row
          justify="center"
          class="overflow-auto"
        >
          <v-col
            v-if="destinations && destinations.length > 0"
            cols="10"
            class="d-flex ga-3 flex-wrap"
          >
            <v-chip
              v-for="(destination, index) in destinations"
              :key="index"
              variant="outlined"
              class="pb-1"
              @click="navigate(destination); isActive.value = false"
            >
              {{ destination.title }}
            </v-chip>
          </v-col>
          <v-col
            v-else-if="!loading && searchText && destinations.length === 0"
            cols="10"
            class="text-center text-grey"
          >
            Aucun résultat trouvé pour votre recherche.
          </v-col>
        </v-row>
      </v-container>
    </template>
  </v-dialog>
</template>

<script setup>
import { mdiClose } from '@mdi/js'
import { useImage } from '#imports'

const img = useImage()

const searchText = ref('')
const loading = ref(true)
const destinations = ref([])

const fetchTopDestinations = async () => {
  const result = await apiRequest(`/search/voyages`)
  destinations.value = result
  loading.value = false
}

onMounted(() => {
  fetchTopDestinations()
})

const getDestinations = async () => {
  const result = await apiRequest(`/search/voyages?keyword=${searchText.value}`)
  destinations.value = result
  console.log(destinations.value)
}

const nbVoyageIdeas = computed(() => {
  if (!searchText.value) {
    return `Commencez votre recherche !`
  }
  return destinations.value.length > 1 ? `${destinations.value.length} idées de voyage` : '1 idée de voyage'
})

function navigate(destination) {
  if (destination.dataSource === 'destinations') {
    navigateTo(`/search?destination=${destination.slug}`)
    searchText.value = ''
    destinations.value = fetchTopDestinations()
  }
  else if (destination.dataSource === 'regions') {
    navigateTo(`/search?destination=${destination.slug}`)
    searchText.value = ''
    destinations.value = fetchTopDestinations()
  }
  else if (destination.dataSource === 'voyages') {
    navigateTo(`/voyages/${destination.slug}`)
    searchText.value = ''
    destinations.value = fetchTopDestinations()
  }
}
</script>

<style scoped>
.border-circle{
  border-radius: 50% !important;
}
.blur{
  backdrop-filter: blur(10px);
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
  height:10px;
  width:10px;
  }
</style>
