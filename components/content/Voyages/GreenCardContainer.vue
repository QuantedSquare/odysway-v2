<template>
  <v-container class="my-md-6">
    <v-row>
      <v-col>
        <v-card
          class="bg-primary"
          variant="text"
          rounded="lg"
        >
          <v-card-title
            cols="12"
            class="d-flex align-center font-weight-bold no-white-space py-4 mt-4"
          >
            <v-icon class="mr-4">
              {{ mdiHandHeartOutline }}
            </v-icon>
            <slot
              name="title"
            />
          </v-card-title>
          <v-divider
            color="white"
            opacity="100"
            class="mx-4"
          />
          <v-card-text>
            <v-list
              variant="text"
              bg-color="primary"
            >
              <slot
                name="items"
                mdc-unwrap="p"
              />
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
