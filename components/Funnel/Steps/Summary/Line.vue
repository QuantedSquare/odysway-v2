<template>
  <v-row
    justify="space-between"
    align="center"
  >
    <v-col>
      <slot name="left" />
    </v-col>
    <v-col cols="auto">
      <slot name="right" />
    </v-col>
  </v-row>
</template>
