<template>
  <v-expansion-panels
    v-show="route.path === '/faq' || !hideOnLayout"
    eager
    variant="accordion"
  >
    <v-expansion-panel
      eager
      class="my-2 py-6"
    >
      <v-expansion-panel-title
        class="text-subtitle-1 font-weight-bold text-md-h6 "
        :class="'text-'+ questionColor"
      >
        <!-- {{ item.question }} -->
        <div v-if="question">
          <MDCRenderer
            :body="question.body"
            :data="question.data"
          />
        </div>
        <div v-if="!item">
          <MDCSlot
            unwrap="p"
            name="question"
          />
        </div>
        <template #actions="{ expanded }">
          <v-icon
            color="secondary"
            :icon="expanded ? mdiMinus : mdiPlus"
          />
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text
        eager
        class="text-subtitle-2 text-md-subtitle-1 text-grey pl-6 bg-white"
      >
        <!-- {{ item.answer }} -->
        <MDCRenderer
          v-if="answer"
          :body="answer.body"
          :data="answer.data"
        />
        <div v-if="!item">
          <MDCSlot
            unwrap="p"
            name="answer"
          />
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { mdiMinus, mdiPlus } from '@mdi/js'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

const route = useRoute()
const { item, displayOnLayout } = defineProps({
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
  hideOnLayout: {
    type: Boolean,
    default: false,
  },
})
const question = ref(null)
const answer = ref(null)
if (item) {
  question.value = await parseMarkdown(item.question)
  answer.value = await parseMarkdown(item.answer)
}
</script>

<style scoped>
.v-expansion-panels:not(.v-expansion-panels--variant-accordion) > :not(:first-child):not(:last-child):not(.v-expansion-panel--active):not(.v-expansion-panel--after-active) {
    border-top-left-radius: 16px !important;
    border-top-right-radius: 16px !important;
}

:deep(.v-expansion-panel-title__overlay ) {
  background-color: rgba(255, 255, 255, 0)!important;
}
</style>
