<template>
  <v-row>
    <VColSectionTitle class="py-12">
      <h2 class="font-weight-black">
        {{ sectionTitle }}
      </h2>
    </VColSectionTitle>
  </v-row>
</template>

<script setup>
defineProps({
  sectionTitle: {
    type: String,
    required: true,
  },
})
</script>
