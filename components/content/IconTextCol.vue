<template>
  <v-col
    cols="6"
    :class="sideBySide ? 'd-flex' : ''"
    class="text-h5 text-primary font-weight-bold mt-8"
  >
    <SanityImage
      :asset-id="icon.asset._ref"
      auto="format"
    >
      <template #default="{ src }">
        <v-img
          :src="src"
          width="40px"
          height="40px"
          class="mb-4 mr-2"
        />
      </template>
    </SanityImage>

    <slot
      name="text"
      mdc-unwrap="p"
    />
  </v-col>
</template>

<script setup>
defineProps({
  icon: {
    type: Object,
  },
  sideBySide: {
    type: Boolean,
    default: true,
  },
})
</script>
