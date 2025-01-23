<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="auto">
          <v-btn-primary>Primary Btn</v-btn-primary>
        </v-col>
        <v-col cols="auto">
          <v-btn-secondary>Secondary Btn</v-btn-secondary>
        </v-col>
      </v-row>
    </v-container>
    <!-- <v-row>
      <v-col cols="12">
        <ContentRenderer
          v-if="page"
          :value="page"
        />
      </v-col>
    </v-row> -->
    <div class="bg-cream">
      <HeroSection />
    </div>
    <div>
      <v-row justify="center">
        <v-col cols="10">
          <SectionTitle :section-title="sectionCategories" />
        </v-col>
      </v-row>
      <CategCarouselHome />
    </div>
    <div id="nos-voyages">
      <NosVoyages />
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content').path('/').first()
})
const sectionCategories = 'Nos thématiques préférées'
</script>
