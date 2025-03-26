<template>
  <v-toolbar
    class="sticky-top"
    height="0"
    extended
    extension-height="64"
  >
    <template #extension>
      <v-tabs
        align-tabs="center"
        class="w-100"
        show-arrows
        color="primary"
      >
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          :text="tab.text"
          class="font-weight-bold"
          @click="goTo(`#${tab.value}`, { offset: -50, easing: 'easeInOutCubic', duration: 1500 })"
        />
      </v-tabs>
    </template>
  </v-toolbar>
</template>

<script setup>
import { useGoTo } from 'vuetify'

const goTo = useGoTo()

const tabs = [
  {
    value: 'les_plus',
    text: 'LES "PLUS"',
  },
  {
    value: 'programme_container',
    text: 'LE PROGRAMME',
  },
  {
    value: 'dates-container',
    text: 'DATES & PRIX',
  },
  {
    value: 'faq-container',
    text: 'FAQ',
  },
]
</script>

<style scoped>
.sticky-top {
  position: sticky !important;
  top: 0;
  z-index: 1010 !important;
  background-color: rgb(var(--v-theme-odysway-1));
}
</style>
