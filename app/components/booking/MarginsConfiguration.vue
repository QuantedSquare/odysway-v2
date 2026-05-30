<template>
  <div>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Configurez la marge par voyageur selon le nombre de pax pour chaque voyage (Pattern A). Une marge fixe peut ensuite être surchargée date par date depuis la fiche départ.
    </p>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col
        cols="4"
        md="3"
      >
        <v-card
          rounded="lg"
          class="bo-card bo-stat-card pa-4"
          elevation="0"
          style="border-left-color: rgb(var(--v-theme-warning));"
        >
          <div class="text-h5 font-weight-bold text-warning">
            {{ unconfiguredCount }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Non configurés
          </div>
        </v-card>
      </v-col>
      <v-col
        cols="4"
        md="3"
      >
        <v-card
          rounded="lg"
          class="bo-card bo-stat-card pa-4"
          elevation="0"
          style="border-left-color: rgb(var(--v-theme-success));"
        >
          <div class="text-h5 font-weight-bold text-success">
            {{ configuredCount }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Configurés
          </div>
        </v-card>
      </v-col>
      <v-col
        cols="4"
        md="3"
      >
        <v-card
          rounded="lg"
          class="bo-card bo-stat-card pa-4"
          elevation="0"
          style="border-left-color: rgb(var(--v-theme-primary));"
        >
          <div class="text-h5 font-weight-bold">
            {{ voyages.length }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Total voyages
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <div class="d-flex align-center ga-3 mb-4 flex-wrap">
      <v-text-field
        v-model="search"
        label="Rechercher par titre ou slug"
        :prepend-inner-icon="mdiMagnify"
        clearable
        hide-details
        density="compact"
        style="max-width: 320px;"
      />
      <v-chip-group
        v-model="filter"
        selected-class="bg-primary text-white"
      >
        <v-chip
          value="all"
          label
          size="small"
        >
          Tous
        </v-chip>
        <v-chip
          value="unconfigured"
          label
          size="small"
        >
          Non configurés
        </v-chip>
        <v-chip
          value="configured"
          label
          size="small"
        >
          Configurés
        </v-chip>
      </v-chip-group>
    </div>

    <!-- List -->
    <div
      v-if="loading"
      class="d-flex justify-center py-12"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      />
    </div>

    <template v-else>
      <v-card
        v-for="voyage in filteredVoyages"
        :key="voyage.slug"
        rounded="lg"
        class="bo-card mb-2"
        elevation="0"
      >
        <NuxtLink
          :to="`/booking-management/margins/${voyage.slug}`"
          class="d-flex align-center ga-3 pa-3 text-decoration-none"
          style="color: inherit;"
        >
          <v-avatar
            size="40"
            rounded="lg"
            color="grey-lighten-3"
          >
            <v-img
              v-if="voyage.image"
              :src="voyage.image"
              cover
            />
            <v-icon
              v-else
              size="24"
              color="grey"
            >
              {{ mdiImageOff }}
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-body-1 font-weight-bold">
              {{ voyage.title || voyage.slug }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ voyage.slug }}
            </div>
          </div>
          <v-chip
            v-if="voyage.configuredPaxCount > 0"
            color="success"
            label
            size="small"
            :prepend-icon="mdiCheckCircle"
          >
            {{ voyage.configuredPaxCount }} pax configurés
          </v-chip>
          <v-chip
            v-else
            color="warning"
            label
            size="small"
          >
            Non configuré
          </v-chip>
          <v-icon
            size="16"
            class="ml-2"
          >
            {{ mdiArrowRight }}
          </v-icon>
        </NuxtLink>
      </v-card>

      <div
        v-if="!filteredVoyages.length"
        class="text-center py-12 text-medium-emphasis"
      >
        Aucun voyage correspondant.
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { mdiMagnify, mdiArrowRight, mdiCheckCircle, mdiImageOff } from '@mdi/js'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

const props = defineProps({
  voyagesList: { type: Array, default: () => [] },
})

const loading = ref(false)
const marginStatus = ref([])
const search = ref('')
const filter = ref('all')

const fetchAll = async () => {
  loading.value = true
  try {
    marginStatus.value = await bookingApi.getMarginsStatus()
  }
  catch (err) {
    console.error(getApiErrorMessage(err, 'Erreur chargement des marges'))
  }
  finally {
    loading.value = false
  }
}

const voyages = computed(() => {
  const statusBySlug = new Map((marginStatus.value || []).map(s => [s.voyage_slug, s]))
  return (props.voyagesList || [])
    .filter(v => v?.slug)
    .map(v => ({
      slug: v.slug,
      title: v.title,
      image: v.image?.asset?.url || null,
      configuredPaxCount: statusBySlug.get(v.slug)?.configured_pax_count || 0,
    }))
})

const configuredCount = computed(() => voyages.value.filter(v => v.configuredPaxCount > 0).length)
const unconfiguredCount = computed(() => voyages.value.filter(v => v.configuredPaxCount === 0).length)

const filteredVoyages = computed(() => {
  const query = search.value?.toLowerCase() || ''
  return voyages.value
    .filter((v) => {
      if (query && !v.slug.toLowerCase().includes(query) && !v.title?.toLowerCase().includes(query)) {
        return false
      }
      if (filter.value === 'unconfigured') return v.configuredPaxCount === 0
      if (filter.value === 'configured') return v.configuredPaxCount > 0
      return true
    })
    .sort((a, b) => {
      if (a.configuredPaxCount === 0 && b.configuredPaxCount > 0) return -1
      if (a.configuredPaxCount > 0 && b.configuredPaxCount === 0) return 1
      return (a.title || a.slug).localeCompare(b.title || b.slug, 'fr')
    })
})

onMounted(fetchAll)
</script>
