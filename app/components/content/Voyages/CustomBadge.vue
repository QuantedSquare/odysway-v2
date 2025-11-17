<template>
  <!-- <v-badge
    inline
    :color="color"
    class="custom"
    dot
  /> -->
  <div class="inline-block">
    <div class="custom-badge">
      <span class="custom-content"/>
    </div>
  </div>
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
const getBackgroundColor = computed(() => {
  return `rgb(var(--v-theme-${props.color}))`
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
.inline-block{
  display: inline-block!important;
}
.custom-content{
  min-width: 10px !important;
  min-height: 10px !important;
  height: 10px !important;
  width: 10px !important;
  background-color: v-bind(getBackgroundColor)!important;
  border-radius: 999px!important;
  display: inline-flex!important;
  align-items: center!important;
  justify-content: center!important;
}
.custom-badge{
  border-radius: 50%;
  max-width: 20px;
  border: 5px solid v-bind(getBorderColor)!important;
  padding: 0px !important;
  display: flex!important;
  align-items: center!important;
  justify-content: center!important;
  border-radius: 999px!important;
}
</style>
