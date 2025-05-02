<template>
  <v-container v-if="voyage.accompanistsList">
    <h4 class="text-h4 font-weight-bold mb-4">
      {{ page.accompanistsTitle }}
    </h4>
    <v-row>
      <v-col class="text-grey-darken-3">
        <div v-if="voyage.accompanistsDescription">
          {{ voyage.accompanistsDescription }}
        </div>
        <AccompanistCard
          v-for="item, index in voyage.accompanistsList"

          :key="index"
          v-bind="item"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const voyage = inject('voyage')
const page = inject('page')
</script>

<style scoped>
.no-white-space {
  white-space: normal;
}
</style>
