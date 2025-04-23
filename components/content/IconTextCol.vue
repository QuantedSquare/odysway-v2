<template>
  <v-col
    cols="6"
    :class="sideBySide ? 'd-flex' : ''"
    class="text-h5 text-primary font-weight-bold mt-8"
  >
    <v-img
      :src="icon"
      width="40px"
      height="40px"
      class="mb-4"
    />
    <slot
      name="text"
      mdc-unwrap="p"
    />
  </v-col>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
  },
  sideBySide: {
    type: Boolean,
    default: true,
  },
})
</script>
