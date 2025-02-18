<template>
  <div>
    <v-container
      class="d-flex align-center position-relative"
    >
      <v-row>
        <v-slide-group
          v-model="currentWindow"
          center-active
          class="w-100"
        >
          <slot />
        </v-slide-group>
      </v-row>
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
.zIndex {
  z-index: 100;
}
</style>
