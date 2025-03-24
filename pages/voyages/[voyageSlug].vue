<template>
  <div>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'voyage',
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => {
  console.log('route', route)
  // route.path ne fonctionne qu'uniquement si on respecte la structure des dossiers nuxt studio (./voyages/[slug])
  // Checker si on peut avoir une alternative plus solide
  return queryCollection('voyages').path(route.path).first()
})
</script>
