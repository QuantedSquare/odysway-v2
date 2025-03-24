<template>
  <div>
    <ContentRenderer
      v-if="page"
      :value="page"
      :data="mdcVars"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'voyage',
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('voyages').path(route.path).first()
})

const mdcVars = ref({ programme: 'coucou' })
</script>
