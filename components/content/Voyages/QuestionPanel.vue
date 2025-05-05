<template>
  <v-expansion-panels>
    <v-expansion-panel
      class="my-2 py-4"
    >
      <v-expansion-panel-title
        class="text-subtitle-1 font-weight-bold text-md-h6 "
        :class="'text-'+ questionColor"
      >
        <div v-if="item">
          {{ item.question }}
        </div>
        <slot
          v-else
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
        <div v-if="item">
          <div v-dompurify-html="parseBoldText(item.answer)" />
        </div>
        <slot
          v-else
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
  item: {
    type: Object,
    default: null,
  },
})
</script>

<style scoped>
.v-expansion-panels:not(.v-expansion-panels--variant-accordion) > :not(:first-child):not(:last-child):not(.v-expansion-panel--active):not(.v-expansion-panel--after-active) {
    border-top-left-radius: 16px !important;
    border-top-right-radius: 16px !important;
}
</style>
