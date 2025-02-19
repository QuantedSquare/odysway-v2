<template>
  <v-expansion-panel class="text-grey-darken-3 my-1">
    <v-expansion-panel-title>
      <slot name="question" />
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <slot name="answer" />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
