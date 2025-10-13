<template>
  <v-col
    cols="12"
    sm="6"
    md="4"
    class="picto_container"
  >
    <SanityImage
      :asset-id="imgSrc.asset._ref"
      auto="format"
    >
      <template #default="{ src }">
        <img
          width="15%"
          class="mb-4"
          :src="src"
        >
      </template>
    </SanityImage>
    <slot name="text" />
  </v-col>
</template>

<script setup>
defineProps({
  imgSrc: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
  .picto_container{
    text-align: center;
    align-content: center;
    align-items: center;
}
</style>
