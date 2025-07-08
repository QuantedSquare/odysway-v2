<template>
  <v-container
    v-if="voyageRef.accompanistsList"
    fluid
    class="px-0 py-0"
  >
    <v-row>
      <v-col
        cols="12"
        class="px-3 px-md-0"
      >
        <h4 class="font-weight-bold text-h4 px-4 px-md-0 mb-4 mb-md-6">
          {{ title }}
        </h4>
      </v-col>
      <v-col class="text-grey-darken-3 py-0 px-5 px-md-4">
        <div
          v-if="voyageRef.accompanistsDescription"
          class="mb-4 text-body-2 text-sm-caption"
        >
          {{ voyageRef.accompanistsDescription }}
        </div>
        <AccompanistCard
          v-for="item, index in voyageRef.accompanistsList"
          :key="index"
          v-bind="item"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps({
  voyage: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})
const voyageRef = toRef(props, 'voyage')

if (voyageRef.value.accompanistsList.length > 0 && !voyageRef.value.accompanistsList[0].description) {
  voyageRef.value.accompanistsList[0].description = voyageRef.value.accompanistsDescription
  delete voyageRef.value.accompanistsDescription
}
</script>

<style scoped>
.no-white-space {
  white-space: normal;
}
</style>
