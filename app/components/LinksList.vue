<template>
  <v-list
    v-for="item, index in list"
    :key="`${item.title + index}`"
    class="d-flex justify-center justify-md-start bg-transparent py-md-0"
  >
    <SmartLink
      :to="item.link"
      class="text-primary text-center text-md-left text-decoration-none bg-transparent"
    >
      {{ item.title }}
    </SmartLink>
  </v-list>
</template>

<script setup>
defineProps({
  list: {
    type: Object,
    required: true,
  },
})
</script>
