<template>
  <v-list-item>
    <v-row>
      <v-col
        cols="12"
        sm="auto"
        class="d-flex justify-center justify-sm-start"
      >
        <v-avatar
          :image="props.avatar"
          :size="props.avatarSize ? props.avatarSize : '80'"
        />
      </v-col>
      <v-col class="d-flex flex-column justify-center align-center align-sm-start">
        <v-list-item-title class="text-center text-sm-start no-white-space mb-2">
          <slot name="title" />
        </v-list-item-title>
        <v-list-item-subtitle class="no-white-space">
          <slot name="subtitle" />
        </v-list-item-subtitle>
        <p class="mt-4">
          <slot
            name="text"
            mdc-unwrap="p"
          />
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
