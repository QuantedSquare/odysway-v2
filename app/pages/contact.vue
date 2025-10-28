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
  validationMessages,
  seo
}`

const { data: contactContent } = await useAsyncData('contact-content', () =>
  sanity.fetch(query),
)
if (contactContent.value) {
  useSeo({
    seoData: contactContent.value?.seo,
    content: contactContent.value,
    pageType: 'website',
    slug: 'contact',
    baseUrl: '/contact',
  })
}
</script>
