<template>
  <v-container
    v-if="voyageRef.accompanistsList"
    fluid
    class="px-0"
  >
    <v-row>
      <v-col cols="12">
        <h4 class="font-weight-black text-h4 my-md-4 pb-0">
          {{ title }}
        </h4>
      </v-col>
      <v-col class="text-grey-darken-3">
        <div
          v-if="voyageRef.accompanistsDescription"
          class="mb-4"
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
