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
      <div class="text-white text-h6">
        {{ props.titre }}
      </div>
    </div>
  </v-container>
</template>

<script setup>
const props = defineProps(['titre', 'image'])
</script>

<style scoped>
.height-title {
  min-height: fit-content!important;
  }
</style>
