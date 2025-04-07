<template>
  <div class="text-center my-3">
    <v-btn
      v-if="!external"
      :to="link"
      :color="color"
    >
      <div class="text-white">
        <slot
          mdc-unwrap="p"
          name="text"
        />
      </div>
    </v-btn>
    <v-btn
      v-else
      :href="link"
      :color="color"
    >
      <div class="text-white">
        <slot
          mdc-unwrap="p"
          name="text"
        />
      </div>
    </v-btn>
  </div>
</template>

<script setup>
defineProps({
  link: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'primary',
  },
  external: {
    type: Boolean,
    default: false,
  },
})
</script>
