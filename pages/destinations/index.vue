<template>
  <ContentLayout
    :display-divider="false"
  >
    <v-row>
      <SearchHeroSection
        v-if="destinations"
      />
    </v-row>

    <template
      #indexContent
    >
      <div class=" pt-md-16">
        <ContentRenderer
          v-if="page"
          :value="page"
        />
      </div>
    </template>
  </ContentLayout>
</template>

<script setup>
const { data: destinations } = useAsyncData('destinations', () => {
  return queryCollection('destinations').where('published', '=', true).all()
})

const page = await queryCollection('content').path('/destinations').first()
</script>
