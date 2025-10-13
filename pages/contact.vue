<template>
  <v-container
    fluid
  >
    <ContactHeroSection :contact-content="contactContent" />
    <ContactForm :contact-content="contactContent" />
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'simple-pages',
})

const sanity = useSanity()

const query = groq`*[_type == "page_contact"][0]{
  formTitle,
  heroSection,
  contactForm,
  gdprSection,
  validationMessages
}`

const { data: contactContent } = await useAsyncData('contact-content', () =>
  sanity.fetch(query)
)

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
