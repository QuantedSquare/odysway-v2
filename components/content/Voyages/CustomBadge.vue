<template>
  <v-badge
    inline
    :color="color"
    class="custom"
  />
</template>

<script setup>
const props = defineProps({
  color: {
    type: String,
    required: true,
  },
})

const getBorderColor = computed(() => {
  return `rgba(var(--v-theme-${props.color}-light))`
})
</script>

<style scoped>
.custom:deep(.v-badge__wrapper) {
  border-radius: 50%;
  border: 5px solid v-bind(getBorderColor)!important;
  padding: 0px !important;
}
.custom:deep(.v-badge__badge) {
  min-width: 10px !important;
  min-height: 10px !important;
  height: 10px !important;
  width: 10px !important;
}
</style>
