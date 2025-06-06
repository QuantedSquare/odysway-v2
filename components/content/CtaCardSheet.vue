<template>
  <v-sheet
    class="text-start text-h5 text-white font-weight-bold bg-primary rounded-xl px-6 d-flex flex-column justify-start"
    :class="route.name === 'search' || route.name.includes('thematiques') || route.name.includes('experience') ? 'h-100' : ''"
  >
    <v-avatar
      size="80"
      class="mt-6"
    >
      <v-img
        :src="img('/images/team/romain.webp', { format: 'webp', quality: 70, height: 640, width: 640 })"
      />
    </v-avatar>

    <span class="text-h3 text-md-h4 text-lg-h3 font-weight-bold my-6">
      Autres questions ?
      Notre équipe est là pour vous renseigner
    </span>
    <span class="text-h6 text-lg-h5 mb-8">
      Texte sous le titre
      <br>lorem
    </span>
    <v-btn-secondary
      class="mb-6"
      height="62px"
      rounded="md"
      width="66%"
      @click="redirectToCalendly"
    >
      <span class="text-h6 text-lg-h5 text-wrap">
        Contactez-nous
      </span>
    </v-btn-secondary>
  </v-sheet>
</template>

<script setup>
import { useImage } from '#imports'

const route = useRoute()
const router = useRouter()
const img = useImage()

function redirectToCalendly() {
  trackPixel('trackCustom', 'ClickRDV')

  if (route.name === 'search') {
    router.push('/calendly?fromSearch')
  }
  else if (route.name.includes('thematiques')) {
    console.log(route.name)
    router.push('/calendly?fromThematiques')
  }
  else if (route.name.includes('experiences')) {
    router.push('/calendly?fromExperiences')
  }
  else {
    router.push(`/calendly?travelTitle=${route.params.voyageSlug}`)
  }
}
</script>
