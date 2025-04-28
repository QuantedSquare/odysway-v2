<template>
  <v-expansion-panels>
    <v-expansion-panel
      class="my-2 py-4"
    >
      <v-expansion-panel-title
        class="text-subtitle-1 font-weight-bold text-md-h6 "
        :class="'text-'+ questionColor"
      >
        <slot
          name="question"
          mdc-unwrap="p"
        />
        <template #actions="{ expanded }">
          <v-icon
            color="secondary"
            :icon="expanded ? mdiMinus : mdiPlus"
          />
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="text-subtitle-2 text-md-subtitle-1 text-grey pl-6 ">
        <slot
          name="answer"
          mdc-unwrap="p"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { mdiMinus, mdiPlus } from '@mdi/js'

defineProps({
  questionColor: {
    type: String,
    default: 'primary',
  },
  answerColor: {
    type: String,
    default: 'grey',
  },
})
</script>

<style scoped>
.v-expansion-panels:not(.v-expansion-panels--variant-accordion) > :not(:first-child):not(:last-child):not(.v-expansion-panel--active):not(.v-expansion-panel--after-active) {
    border-top-left-radius: 16px !important;
    border-top-right-radius: 16px !important;
}
</style>
