<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-row class="mb-4">
          <slot name="tooltip-text-group" />
        </v-row>
      </v-col>
      <v-col cols="12">
        <slot name="intro-voyage" />
      </v-col>
      <v-col cols="12">
        <v-list>
          <slot name="avatar" />
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>
