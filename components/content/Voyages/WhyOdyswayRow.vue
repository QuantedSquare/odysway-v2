<template>
  <v-container class="my-6">
    <v-row>
      <v-col>
        <v-card
          class="bg-primary"
          variant="text"
          rounded="lg"
        >
          <v-card-title
            cols="12"
            class="py-4 no-white-space"
          >
            <v-icon class="mr-4">
              {{ mdiHandHeartOutline }}
            </v-icon>
            <div class="d-inline">
              <span>
                <slot
                  name="title"
                  mdc-unwrap="p"
                /></span>
            </div>
          </v-card-title>
          <!-- <v-divider  /> -->
          <v-card-text>
            <v-list
              variant="text"
              bg-color="primary"
            >
              <slot name="items" />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiHandHeartOutline } from '@mdi/js'
</script>

<style scoped>
.no-white-space {
  white-space: normal;
}
</style>
