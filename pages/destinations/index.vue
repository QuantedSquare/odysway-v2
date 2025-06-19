<template>
  <ContentLayout>
    <v-row>
      <SearchHeroSection
        v-if="destinations"
      />
    </v-row>

    <template #indexContent>
      <ContentRenderer
        v-if="page"
        :value="page"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const { data: destinations } = useAsyncData('destinations', () => {
  return queryCollection('destinations').where('published', '=', true).all()
})

const page = await queryCollection('content').path('/destinations').first()
</script>
