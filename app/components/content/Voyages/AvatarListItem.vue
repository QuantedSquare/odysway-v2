<template>
  <v-list-item>
    <v-row>
      <v-col
        cols="12"
        sm="auto"
        class="d-flex justify-center justify-sm-start"
      >
        <AvatarImg
          :avatar-img="image"
          :avatar-size="avatarSize"
        />
      </v-col>
      <v-col class="d-flex flex-column justify-center align-center align-sm-start">
        <v-list-item-title class="text-h5 font-weight-bold text-center text-sm-start no-white-space mb-2">
          {{ name }}
        </v-list-item-title>
        <v-list-item-subtitle class="no-white-space text-h5">
          {{ role }}
        </v-list-item-subtitle>
        <p class="mt-4 text-grey text-h5 font-weight-regular">
          {{ description }}
        </p>
      </v-col>
    </v-row>
  </v-list-item>
</template>

<script setup>
defineProps({
  image: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: '',
  },
  avatarSize: {
    type: String,
    default: '80',
  },
})
</script>

<style scoped>
.no-white-space {
  white-space: normal;
}
</style>
