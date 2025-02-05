<template>
  <div>
    <v-container>
      <v-row
        justify="center"
      >
        <v-col
          cols="12"
          class="text-dark"
        >
          <slot
            name="text"
          />
        </v-col>
        <v-col>
          <v-img
            :src="imageSrc"
            rounded="lg"
            class="my-8"
            cover
          />
          <slot name="capture" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
defineProps({
  imageSrc: {
    type: String,
    required: true,
  },
})
</script>
