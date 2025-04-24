<template>
  <div class="d-flex align-center ga-4">
    <v-avatar
      :image="authorAvatar"
      size="60"
    />
    <div class="text-body-2 text-lg-body-1 d-flex flex-column justify-center align-center align-sm-start ga-4">
      <div class="text-primary  font-weight-bold">
        {{ authorName }}
      </div>
      <div class="text-grey">
        {{ authorRole }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  authorAvatar: {
    type: String,
  },
  authorName: {
    type: String,
  },
  authorRole: {
    type: String,
  },
})
</script>
