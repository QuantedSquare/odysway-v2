<template>
  <v-container class="mb-md-8">
    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <v-row>
          <v-col
            cols="12"
          >
            <v-row class="mb-4">
              <slot name="tooltip-text-group" />
            </v-row>
          </v-col>
          <v-col
            cols="12"
          >
            <slot name="intro-voyage" />
          </v-col>
          <v-col
            cols="12"
          >
            <v-list slim>
              <slot name="avatar" />
            </v-list>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        md="4"
        class="d-none d-md-flex"
      >
        <slot name="info-card" />
      </v-col>
    </v-row>
  </v-container>
</template>
