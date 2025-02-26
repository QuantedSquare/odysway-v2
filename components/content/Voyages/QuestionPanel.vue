<template>
  <v-expansion-panel class="text-grey-darken-3 my-2">
    <v-expansion-panel-title class="text-subtitle-1 text-md-h6">
      <slot name="question" />
    </v-expansion-panel-title>
    <v-expansion-panel-text class="text-body-1">
      <slot name="answer" />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
