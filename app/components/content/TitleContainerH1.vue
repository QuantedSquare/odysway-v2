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
        <h2 class="text-h3 text-md-h2">
          <slot
            name="title"
            mdc-unwrap="p"
          />
        </h2>
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
