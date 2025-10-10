<template>
  <div class="my-md-8 mt-md-12 mb-md-5 ">
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
                  size="28"
                  :icon="mdiHeartOutline"
                />
              </v-avatar>
              <h4 class="text-h4 font-weight-bold">
                {{ page.title }}
              </h4>
            </div>
            <v-list
              slim
              bg-color="yellow-light-2"
              class=""
              role="list"
              :aria-label="`Points forts de ${page.title}`"
            >
            <!-- #TODO: Add highlights, from sanity -->
              <!-- <HighlightListItem
                v-for="highlight in experiencesBlock"
                :key="highlight"
                :highlight="highlight"
              /> -->
            </v-list>
          </v-col>
        </v-row>
      </v-container>
    </ColorContainer>
  </div>
</template>

<script setup>
import { mdiHeartOutline } from '@mdi/js'

defineProps({
  experiencesBlock: {
    type: Array,
    required: true,
  },
  page: {
    type: Object,
    required: true,
  },
})
</script>
