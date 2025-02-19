<template>
  <!-- @Vlad todo en v-list-item -->
  <div class="d-flex align-center my-2">
    <v-avatar
      :image="props.avatar"
      size="80"
    />
    <div class="d-flex flex-column">
      <v-card-title class="no-white-space">
        <slot name="guide-title" />
      </v-card-title>
      <v-card-subtitle class="no-white-space">
        <slot name="guide-subtitle" />
      </v-card-subtitle>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  avatar: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.no-white-space {
  white-space: normal;
}
</style>
