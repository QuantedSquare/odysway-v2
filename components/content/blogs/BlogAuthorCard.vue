<template>
  <v-container
    :fluid="width < 1440"
    class="px-0"
  >
    <v-card class="pa-10">
      <v-row dense>
        <v-col
          cols="12"
          sm="auto"
          class="d-flex justify-center justify-sm-start"
        >
          <v-avatar
            :image="authorAvatar"
            size="86"
          />
        </v-col>
        <v-col class="d-flex flex-column justify-center align-center align-sm-start">
          <v-card-title class="text-primary text-h4 font-weight-bold text-center text-sm-start no-white-space">
            {{ authorName }}
          </v-card-title>
          <v-card-subtitle class="text-secondary text-h4 no-white-space ">
            {{ authorRole }}
          </v-card-subtitle>

          <v-card-text class="text-h4 text-grey">
            <slot
              name="text"
            />
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

defineProps({
  authorAvatar: {
    type: String,
  },
  authorName: {
    type: String,
  },
  authorRole: {
    type: String,
  },
})

const { width } = useDisplay()
</script>
