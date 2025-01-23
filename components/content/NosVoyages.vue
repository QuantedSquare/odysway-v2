<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <SectionTitle :section-title="sectionFrance" />
        <v-row justify="center">
          <VoyagesCardList />
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const sectionFrance = 'Nos séjours en France'
</script>
