<template>
  <v-btn
    :to="link"
    :color="color"
    height="62"
    size="large"
    class="text-decoration-none"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <div
      class="text-body-1 font-weight-bold mx-4"
      :class="`text-${textColor}`"
    >
      <slot
        mdc-unwrap="p"
        name="text"
      />
    </div>
  </v-btn>
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
  textColor: {
    type: String,
    default: 'white',
  },
  external: {
    type: Boolean,
    default: false,
  },
})
</script>
