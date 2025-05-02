<template>
  <div class="my-8 mt-md-12 mb-md-5 ">
    <ColorContainer
      color="yellow-light-2"
    >
      <v-container class="py-0">
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
                  size="22"
                  :icon="mdiHeartOutline"
                />
              </v-avatar>
              <h4 class="text-h4 font-weight-bold">
                Ce qui vous attend
              </h4>
            </div>
            <v-list
              slim
              bg-color="yellow-light-2"
            >
              <HighlightListItem
                v-for="highlight in experiencesBlock"
                :key="highlight"
                :highlight="highlight"
              />
            </v-list>
          </v-col>
        </v-row>
      </v-container>
    </ColorContainer>
  </div>
</template>

<script setup>
import { mdiHeartOutline } from '@mdi/js'
import HighlightListItem from './HighlightListItem.vue'

const { experiencesBlock } = inject('voyage')
</script>
