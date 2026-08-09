<template>
  <div>
    <BoPageHeader
      title="Voyages sur-mesure"
      subtitle="Un voyage sur-mesure se crée dans Sanity, en cochant « Voyage sur-mesure »."
      :crumbs="[{ title: 'Backoffice', to: '/booking-management' }, { title: 'Sur-mesure' }]"
    />

    <div class="bo-well">
      <v-autocomplete
        v-model="search"
        :items="travelesList"
        label="Rechercher un voyage"
        item-title="title"
        item-value="slug"
        clearable
        style="max-width: 360px;"
      />

      <div
        v-if="loading"
        class="bo-cards-grid"
      >
        <v-skeleton-loader
          v-for="n in 6"
          :key="n"
          type="image, list-item"
        />
      </div>

      <div
        v-else-if="filteredTravels.length"
        class="bo-cards-grid"
      >
        <button
          v-for="travel in filteredTravels"
          :key="travel.slug"
          type="button"
          class="bo-card bo-travel-card"
          @click="goToTravel(travel.slug)"
        >
          <img
            :src="travel.image || '/images/IMG_20250101_161727_049.jpg'"
            :alt="''"
            class="bo-travel-card__img"
          >
          <span class="bo-travel-card__body">
            <span class="bo-cell__title">{{ travel.title || travel.slug }}</span>
            <span class="bo-cell__slug">{{ travel.slug }}</span>
          </span>
        </button>
      </div>

      <div
        v-else
        class="bo-card bo-empty"
      >
        Aucun voyage sur-mesure trouvé.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BoPageHeader from '~/components/booking/BoPageHeader.vue'
import { bookingApi, getApiErrorMessage } from '~/utils/bookingApi'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

const search = ref(null)
const loading = ref(false)
const sanity = useSanity()
const router = useRouter()

const travelesListQuery = `*[_type == "voyage" && ('custom' in availabilityTypes)]{
  slug,
  title,
  image {
    asset -> {
      url
    }
  }
}`

const travelesList = ref([])
const travels = ref([])

const fetchTravels = async () => {
  loading.value = true
  try {
    const data = await bookingApi.getTravels()
    travels.value = (data || []).filter(travel => travel.is_custom_travel)
    travelesList.value = await sanity.fetch(travelesListQuery)
  }
  catch (err) {
    console.error(getApiErrorMessage(err, 'Erreur chargement'))
    travels.value = []
  }
  finally {
    loading.value = false
  }
}

const goToTravel = (slug) => {
  router.push(`/booking-management/${slug}`)
}

const filteredTravels = computed(() => {
  const enrichedTravelsDate = travelesList.value.map((travel) => {
    return {
      image: travel?.image?.asset?.url,
      title: travel?.title,
      slug: travel?.slug.current,
    }
  })
  if (search.value) {
    return enrichedTravelsDate?.filter(travel => travel.title.includes(search.value))
  }
  return enrichedTravelsDate
})

onMounted(fetchTravels)
</script>

<style scoped>
.bo-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.bo-travel-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.12s;
}

.bo-travel-card:hover {
  border-color: var(--bo-ink-3) !important;
}

.bo-travel-card__img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}

.bo-travel-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
}
</style>
