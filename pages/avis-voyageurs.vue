<template>
  <v-container
    class="py-0 px-2 px-md-4 pt-4 pt-md-0"
    fluid
  >
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </v-container>
</template>

<script setup>
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})

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
    ogUrl: `https://odysway.com${route.path}`,
    twitterTitle: page.value.seo?.title || page.value.title,
    twitterDescription: page.value.seo?.description || page.value.description,
    twitterCard: 'summary_large_image',
    canonical: `https://odysway.com${route.path}`,
    robots: page.value.robots || 'index, follow',
  })
}
</script>
