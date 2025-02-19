<template>
  <v-list-item>
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        cols="12"
        md="auto"
        class="d-flex justify-center justify-md-start"
      >
        <v-avatar
          :image="props.avatar"
          size="80"
        />
      </v-col>
      <v-col class="d-flex flex-column align-center align-md-start">
        <v-card-title class="no-white-space">
          <slot name="title" />
        </v-card-title>
        <v-card-subtitle class="no-white-space">
          <slot name="subtitle" />
        </v-card-subtitle>
        <v-card-text>
          <slot name="text" />
        </v-card-text>
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
})
</script>

<style scoped>
.no-white-space {
  white-space: normal;
}
</style>
