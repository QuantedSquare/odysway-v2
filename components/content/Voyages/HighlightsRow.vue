<template>
  <div class="my-8 my-md-12">
    <ColorContainer
      color="yellow-light-2"
    >
      <v-container>
        <v-row>
          <v-col
            cols="12"
            class="text-primary d-flex flex-column justify-lg-center"
          >
            <div class="d-flex align-center ga-4">
              <v-avatar
                color="yellow"
                size="40"
              >
                <v-icon
                  color="white"
                  size="20"
                  :icon="mdiHeartOutline"
                />
              </v-avatar>
              <h4 class="text-h4 font-weight-bold">
                <slot name="title" />
              </h4>
            </div>
            <v-list
              slim
              bg-color="yellow-light-2"
            >
              <slot />
            </v-list>
          </v-col>
        </v-row>
      </v-container>
    </ColorContainer>
  </div>
</template>

<script setup>
import { mdiHeartOutline } from '@mdi/js'
</script>
