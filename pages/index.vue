<template>
  <v-container>
    <v-row>
      <v-col cols="auto">
        <v-btn-primary>Primary Btn</v-btn-primary>
      </v-col>
      <v-col cols="auto">
        <v-btn-secondary>Secondary Btn</v-btn-secondary>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <ContentRenderer
          v-if="page"
          :value="page"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content').path('/').first()
})
</script>
