<template>
  <div>
    <v-btn
      v-if="!external"
      :to="link"
      :color="color"
      block
      height="62"
      size="large"
    >
      <div class="text-white text-decoration-none text-body-1 font-weight-bold">
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
      block
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
