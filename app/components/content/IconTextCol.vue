<template>
  <v-col
    cols="6"
    :class="sideBySide ? 'd-flex' : ''"
    class="text-h5 text-primary font-weight-bold mt-8"
  >
    <v-img
      v-if="iconUrl"
      :src="iconUrl"
      width="40px"
      height="40px"
      class="mb-4 mr-2"
    />

    <slot
      name="text"
      mdc-unwrap="p"
    />
  </v-col>
</template>

<script setup>
const { icon } = defineProps({
  icon: {
    type: Object,
    required: true,
  },
  sideBySide: {
    type: Boolean,
    default: true,
  },
})
const iconUrl = computed(() => {
  return getImageUrl(icon?.asset?._ref)
})
</script>
