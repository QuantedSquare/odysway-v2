<template>
  <v-container
    :fluid="width > 600"
    class="py-0 my-0 px-2 px-md-9"
  >
    <FaqContainer />
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()

definePageMeta({
  layout: 'no-faq',
})

// Fetch FAQ data for SEO structured data
const { getFaqsForSchema } = await useFaqData({
  includeHidden: true, // Include all FAQs on the FAQ page
})
// Add SEO with FAQ structured data
useSeo({
  seoData: {},
  content: {
    title: 'FAQ - Questions fréquentes',
    description: 'Retrouvez les réponses aux questions les plus fréquentes sur nos voyages en petits groupes : réservation, organisation, destinations et bien plus.',
  },
  pageType: 'website',
  slug: 'faq',
  structuredData: createFAQPageSchema(getFaqsForSchema.value),
})
</script>
