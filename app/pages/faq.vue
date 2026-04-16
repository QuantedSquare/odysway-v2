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
import { portableTextToPlain } from '~/utils/portableTextToPlain'

const { width } = useDisplay()

definePageMeta({
  layout: 'no-faq',
})

const { faqData, getFaqsForSchema } = await useFaqData({
  includeHidden: true,
})

useSeo({
  seoData: faqData.value?.seo || {},
  content: {
    title: 'FAQ - Questions fréquentes',
    description: 'Retrouvez les réponses aux questions les plus fréquentes sur nos voyages en petits groupes : réservation, organisation, destinations et bien plus.',
  },
  pageType: 'website',
  slug: 'faq',
})

useSchemaOrg([
  defineWebPage({ '@type': ['WebPage', 'FAQPage'] }),
  ...(getFaqsForSchema.value || [])
    .map((faq) => {
      const answerText = typeof faq.answer === 'string'
        ? faq.answer
        : Array.isArray(faq.answer)
          ? portableTextToPlain(faq.answer)
          : ''
      if (!faq.question?.trim() || !answerText.trim()) return null
      return defineQuestion({
        name: faq.question.trim(),
        acceptedAnswer: answerText.trim(),
      })
    })
    .filter(Boolean),
])
</script>
