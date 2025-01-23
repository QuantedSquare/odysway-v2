<template>
  <v-row>
    <VColSectionTitle>
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
