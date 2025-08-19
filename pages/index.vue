<template>
  <v-container
    class="py-0 my-0 px-2 px-md-4"
    fluid
  >
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </v-container>
</template>

<script setup>
const { data: page } = await useAsyncData('homepage', () => queryCollection('content').path('/').first())

if (page.value) {
  // Set the page title explicitly
  useHead({
    title: page.value.seo?.title || page.value.title,
    htmlAttrs: {
      lang: 'fr',
    },
    ...page.value.head,
  })

  // Set SEO meta tags
  useSeoMeta({
    title: page.value.seo?.title || page.value.title,
    description: page.value.seo?.description || page.value.description,
    ogTitle: page.value.seo?.title || page.value.title,
    ogDescription: page.value.seo?.description || page.value.description,
    ogType: 'website',
    ogUrl: 'https://odysway.com/',
    twitterTitle: page.value.seo?.title || page.value.title,
    twitterDescription: page.value.seo?.description || page.value.description,
    twitterCard: 'summary_large_image',
    canonical: 'https://odysway.com/',
    robots: page.value.robots || 'index, follow',
  })
}
</script>
