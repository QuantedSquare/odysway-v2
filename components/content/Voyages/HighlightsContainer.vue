<template>
  <div class="my-md-8 mt-md-12 mb-md-5 ">
    <ColorContainer
      color="yellow-light-2"
    >
      <v-container
        v-if="experiencesBlock && experiencesBlock.length > 0"
        class="py-0"
      >
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
              <EnrichedText
                class="custom-list-item"
                :value="experiencesBlock"
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

defineProps({
  experiencesBlock: {
    type: Array,
    default: () => [],
  },
  page: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.custom-list-item:deep(ul) {
    position: relative;
    list-style: none!important;
    margin-left: 0;
    padding-left: 1.2em;
}
.custom-list-item:deep(ul li:before) {
    content: url('/assets/done.svg') !important;
    position: absolute;
    left: 0;
    margin-top: 0.2em!important;
}
.custom-list-item:deep(ul li) {
  margin-left: 0.8em;
}
</style>
