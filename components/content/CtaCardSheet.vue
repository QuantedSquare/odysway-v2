<template>
  <v-sheet
    class="text-start text-h5 text-white font-weight-bold bg-primary rounded-lg  mx-0 px-8 py-md-5 d-flex flex-column justify-start mt-2"
    :class="route.name === 'search' || route.name.includes('thematiques') || route.name.includes('experience') ? 'h-100' : ''"
  >
    <v-avatar
      size="80"
      class="mt-6"
    >
      <v-img
        :src="img(faqTextes?.faqSection?.ctaCard?.avatar, { format: 'webp', quality: 70, height: 640, width: 640 })"
      />
    </v-avatar>

    <span class="text-h3 text-md-h4 text-lg-h3 font-weight-bold my-6">
      {{ faqTextes?.faqSection?.ctaCard?.title }}

    </span>
    <span class="text-subtitle-2 mb-8">
      {{ faqTextes?.faqSection?.ctaCard?.subtitle }}
    </span>
    <v-btn-secondary
      class="align-self-center align-self-md-start mb-6 mb-md-4"
      height="62"
      rounded="md"
      width="220"
      @click="redirectToCalendly"
    >
      <span class="text-h6 text-lg-h5 text-wrap">
        {{ faqTextes?.faqSection?.ctaCard?.button?.text }}
      </span>
    </v-btn-secondary>
  </v-sheet>
</template>

<script setup>
import { useImage } from '#imports'

const route = useRoute()
const router = useRouter()
const img = useImage()

const { data: faqTextes } = await useAsyncData('faq-textes', () => {
  return queryCollection('ctas').select('faqSection').first()
})
console.log('faqTextes', faqTextes.value)

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
