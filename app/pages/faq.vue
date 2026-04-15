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
const { faqData, getFaqsForSchema } = await useFaqData({
  includeHidden: true, // Include all FAQs on the FAQ page
})
const route = useRoute()
watchEffect(() => {
  if (!faqData.value) return
  useSeo({
    seoData: faqData.value.seo || {},
    content: {
      title: 'FAQ - Questions fréquentes',
      description: 'Retrouvez les réponses aux questions les plus fréquentes sur nos voyages en petits groupes : réservation, organisation, destinations et bien plus.',
    },
    pageType: 'website',
    slug: 'faq',
    structuredData: getFaqsForSchema.value?.length
      ? createFAQPageSchema(getFaqsForSchema.value, `https://odysway.com${route.path}`)
      : null,
  })
})
</script>
