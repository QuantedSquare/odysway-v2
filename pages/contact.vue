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

const { data: contactContent } = await useAsyncData('contact-content', () =>
  queryCollection('page_contact').first(),
)

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
