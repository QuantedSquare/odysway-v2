<template>
  <v-container
    fluid
  >
    <ContactHeroSection :contact-content="contactContent" />
    <h2 class="text-h2 text-center my-8">
      {{ contactContent?.formTitle || 'Formulaire de contact' }}
    </h2>
    <ContactForm :contact-content="contactContent" />
  </v-container>
</template>

<script setup>
const { data: contactContent } = await useAsyncData('contact-content', () =>
  queryCollection('page_contact').first(),
)
</script>
