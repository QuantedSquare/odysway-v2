<template>
  <v-container class="mt-16">
    <DestinationsDrawerContent
      :destinations="destinationsItems"
    />
    <v-row
      justify="center"
      class="mt-4"
    >
      <ContentRenderer
        v-if="page"
        :value="page"
      />
    </v-row>
  </v-container>
</template>

<script setup>
const route = useRoute()

const [{ data: destinationsItems }, { data: page }] = await Promise.all([
  useAsyncData('destinations', () => queryCollection('destinations').all()),
  useAsyncData(route.path, () => queryCollection('destinationsPage').path(route.path).first()),
])
</script>
