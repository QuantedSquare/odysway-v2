<template>
  <v-container>
    <v-row
      justify="center"
      align="center"
      no-gutters
    >
      <v-col
        class="font-weight-black mt-4"
      >
        <h3 class="text-h4 text-md-h3">
          <slot
            name="subtitle"
            mdc-unwrap="p"
          />
        </h3>
      </v-col>
      <v-col
        v-if="id"
        cols="auto"
      >
        <div :id="id" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    default: '',
  },
})
</script>
