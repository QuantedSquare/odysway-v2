<template>
  <div>
    <v-btn
      v-if="!external"
      :to="link"
      :color="color"
      height="62"
      size="large"
    >
      <div
        class="text-decoration-none text-body-1 font-weight-bold mx-4"
        :class="`text-${textColor}`"
      >
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
      height="62"
      size="large"
    >
      <div class="text-white text-decoration-none text-body-1 font-weight-bold mx-4">
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
