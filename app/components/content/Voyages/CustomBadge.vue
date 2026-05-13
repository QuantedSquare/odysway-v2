<template>
  <div class="inline-block">
    <div class="custom-badge">
      <span class="custom-content" />
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
.inline-block{
  display: inline-block!important;
}
.custom-badge {
  width: 20px;
  height: 20px;
  box-sizing: border-box;
  border: 5px solid v-bind(getBorderColor);
  background: v-bind(getBorderColor);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-content {
  width: 10px;
  height: 10px;
  background-color: v-bind(getBackgroundColor);

  border-radius: 50%;

  display: block;
  flex: none;
}
</style>
