<template>
  <v-container>
    <v-row>
      <v-col
        v-if="programme"
        cols="12"
      >
        <a
          :href="programme"
          target="_blank"
          class="text-primary"
        >Télécharger le détail du voyage en PDF</a>
      </v-col>
      <v-col
        cols="12"
      >
        <v-row class="mb-4">
          <slot name="tooltip-text-group" />
        </v-row>
      </v-col>
      <v-col
        cols="12"
        class="text-body-1 text-grey-darken-3"
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
  </v-container>
</template>

<script setup>
const props = defineProps(['programme'])
</script>
