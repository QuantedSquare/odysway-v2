<template>
  <v-row
    justify="space-between"
    align="center"
  >
    <v-col class="text-body-2">
      <slot name="left" />
    </v-col>
    <v-col
      cols="auto"
      class="text-body-2"
    >
      <slot name="right" />
    </v-col>
  </v-row>
</template>
