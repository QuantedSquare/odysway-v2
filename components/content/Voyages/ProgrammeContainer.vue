<template>
  <v-container
    fluid
    class="px-0"
  >
    <v-row v-if="programmeBlock">
      <v-col cols="12">
        <h4 class="font-weight-black text-h4 my-1 my-md-4 pb-0 pb-md-4 px-2 px-md-0">
          <!-- #TODO: Add title from sanity -->
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
          :index="index"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  programmeBlock: {
    type: Array,
    required: true,
  },
})
</script>
