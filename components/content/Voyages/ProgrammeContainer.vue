<template>
  <v-container
    fluid
    class="px-0"
  >
    <v-row v-if="programmeBlock">
      <v-col cols="12">
        <h4 class=" font-weight-black text-h2 my-4 pb-0 pb-md-4">
          Au programme
        </h4>
      </v-col>
      <v-col
        v-for="(day, index) of programmeBlock"
        :key="index"
        cols="12"
      >
        <DayCard
          v-bind="day"
          v-model="expandedIndex"
          :index="index"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const expandedIndex = ref(null)

const { programmeBlock } = inject('voyage')
</script>
