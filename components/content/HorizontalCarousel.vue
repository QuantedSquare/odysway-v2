<template>
  <div>
    <v-container
      class="d-flex align-center position-relative "
    >
      <!-- <v-row class="overflow-x-hidden"> -->
      <v-slide-group
        v-model="currentWindow"
        :show-arrows="true"
        center-active
        class="w-100"
      >
        <slot name="carousel-item" />
      </v-slide-group>
      <!-- </v-row> -->
    </v-container>
  </div>
</template>

<script setup>
const currentWindow = ref(0)
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
</style>
