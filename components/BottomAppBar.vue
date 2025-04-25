<template>
  <v-app-bar
    location="bottom"
    class="d-md-none pb-1 pb-sm-0 bottom-app-bar"
  >
    <v-container class="py-0">
      <v-row
        no-gutters
        class="mx-4"
      >
        <v-col
          cols="5"
          class="d-flex flex-column align-start"
        >
          <span class="text-caption text-grey">
            À partir de
          </span>
          <span class="text-body-2 font-weight-bold text-primary">
            {{ 600 }}€<span class="text-caption">/pers</span>
          </span>
        </v-col>
        <v-spacer class="d-block" />
        <v-col
          cols="5"
          class="d-flex align-center justify-end"
        >
          <v-btn-secondary
            density="compact"
            height="50"
            rounded="md"
            color="primary"
            class="text-caption font-weight-bold text-decoration-none"
            @click="goTo('#dates-container', { offset: -200 })"
          >
            <slot name="text-btn-1" />
          </v-btn-secondary>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { useGoTo } from 'vuetify'

const route = useRoute()

const goTo = useGoTo()
</script>

<style scoped>
.bottom-app-bar{
  z-index: 1020 !important;
}
</style>
