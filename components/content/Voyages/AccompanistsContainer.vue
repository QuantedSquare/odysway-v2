<template>
  <v-container
    v-if="voyageRef.accompanistsList"
    fluid
    class="px-0 py-0"
  >
    <v-row>
      <v-col
        cols="12"
        :class="!voyageRef.accompanistsDescription ? 'py-3' : 'pt-3 pb-0'"
      >
        <h4 class="font-weight-bold text-h4 my-1 my-md-4 pb-0 pb-md-4 px-2 px-md-0">
          {{ title }}
        </h4>
      </v-col>
      <v-col class="text-grey-darken-3 py-0 px-5 px-md-4">
        <div
          v-if="voyageRef.accompanistsDescription"
          class="mb-4 font-weight-regular text-subtitle-2 text-md-body-2 line-height-2"
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
.line-height-2 {
  line-height: 1.4 !important;
}
</style>
