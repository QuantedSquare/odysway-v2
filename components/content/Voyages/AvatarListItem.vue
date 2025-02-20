<template>
  <v-list-item>
    <v-row>
      <v-col
        cols="12"
        md="auto"
        class="d-flex justify-center justify-md-start"
      >
        <v-avatar
          :image="props.avatar"
          :size="props.avatarSize ? props.avatarSize : '80'"
        />
      </v-col>
      <v-col class="d-flex flex-column justify-center align-center align-md-start">
        <v-list-item-title class="text-center text-md-start no-white-space mb-2">
          <slot name="title" />
        </v-list-item-title>
        <v-list-item-subtitle class="no-white-space">
          <slot name="subtitle" />
        </v-list-item-subtitle>
        <p class="mt-4">
          <slot name="text" />
        </p>
      </v-col>
    </v-row>
  </v-list-item>
</template>

<script setup>
const props = defineProps({
  avatar: {
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
