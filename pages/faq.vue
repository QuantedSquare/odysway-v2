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

// const route = useRoute()
const { width } = useDisplay()

definePageMeta({
  layout: 'no-faq',
})
// const { data: page } = await useAsyncData(route.path, () => {
//   return queryCollection('content').path(route.path).first()
// })
// if (page.value) {
//   defineOgImageComponent(page.value?.ogImage?.component, {
//     title: page.value.ogImage?.props.title,
//     description: page.value.ogImage?.props.description,
//     image: page.value.ogImage?.props.image,
//     // author: page.value?.ogImage?.author,
//     // twitter: page.value?.ogImage?.twitter,
//   })

//   // Set the page title explicitly
//   useHead({
//     title: page.value.seo?.title || page.value.title,
//     htmlAttrs: { lang: 'fr' },
//     ...page.value.head,
//   })

//   // Set SEO meta tags
//   useSeoMeta({
//     title: page.value.seo?.title || page.value.title,
//     description: page.value.seo?.description || page.value.description,
//     ogTitle: page.value.seo?.title || page.value.title,
//     ogDescription: page.value.seo?.description || page.value.description,
//     ogType: 'website',
//     ogUrl: `https://odysway.com${route.path}`,
//     twitterTitle: page.value.seo?.title || page.value.title,
//     twitterDescription: page.value.seo?.description || page.value.description,
//     twitterCard: 'summary_large_image',
//     canonical: `https://odysway.com${route.path}`,
//     robots: page.value.robots || 'index, follow',
//   })
// }
</script>
