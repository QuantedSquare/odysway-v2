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
        <v-col class="d-flex align-center">
          <v-avatar class="mr-4">
            <v-img :src="imageSrc" />
          </v-avatar>
          <slot name="founder" />
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
