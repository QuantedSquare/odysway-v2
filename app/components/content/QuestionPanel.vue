<template>
  <v-expansion-panels
    v-show="route.path === '/faq' || !hide"
    eager
    variant="accordion"
  >
    <v-expansion-panel
      eager
      class="my-1 my-md-2 py-md-6 pa-1"
    >
      <v-expansion-panel-title
        class="text-caption text-sm-subtitle-2 font-weight-bold text-md-h6 "
        :class="'text-'+ questionColor"
      >
        <div v-if="question">
          <!-- <MDCRenderer
            :body="question.body"
            :data="question.data"
          /> -->
          {{ item.question }}
        </div>
        <!-- <div v-if="!item">
          <MDCSlot
            unwrap="p"
            name="question"
          />
        </div> -->
        <template #actions="{ expanded }">
          <v-icon
            color="secondary"
            :icon="expanded ? mdiMinus : mdiPlus"
          />
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text
        eager
        class="text-subtitle-2 text-md-subtitle-1 text-grey pl-md-6 bg-white"
      >
        <!-- <MDCRenderer
          v-if="answer"
          class="custom-font-size"
          :body="answer.body"
          :data="answer.data"
        /> -->
        <EnrichedText :value="item.answer" />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { mdiMinus, mdiPlus } from '@mdi/js'

const route = useRoute()
const { item } = defineProps({
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
  hide: {
    type: Boolean,
    default: false,
  },
})
const question = ref(null)
const answer = ref(null)
if (item) {
  question.value = (item.question)
  answer.value = (item.answer)
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
.custom-font-size{
  font-size: 13px!important;
  font-weight: 300!important;
}
@media screen and (min-width: 600px) {
  .custom-font-size{
    font-size: 14px!important;
    font-weight: 400!important;
  }
}
@media screen and (min-width: 900px) {
  .custom-font-size{
    font-size: 16px!important;
    font-weight: 500!important;
  }
}
</style>
