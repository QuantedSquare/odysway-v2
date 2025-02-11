<template>
  <v-container
    class="height-title bg-primary hidden-md-and-down px-6"
    fluid
  >
    <div class="d-flex flex-column align-center ga-4 flex-md-row ">
      <v-avatar
        :image="props.image || 'https://odysway.com/logos/logo_noir.png'"
        size="100"
        rounded="lg"
      />
      <div class="text-white text-h6 d-flex flex-column">
        <span>
          {{ props.titre }}
        </span>
        <span
          v-if="props.travelType"
          class="text-caption"
        >
          {{ props.travelType }}
        </span>
      </div>
    </div>
  </v-container>
</template>

<script setup>
const props = defineProps(['titre', 'image', 'travelType'])
</script>

<style scoped>
.height-title {
  min-height: fit-content!important;
  }
</style>
