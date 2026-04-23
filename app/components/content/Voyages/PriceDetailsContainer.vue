<template>
  <v-container
    v-if="pricingDetailsBlock?.listInclude?.length > 0 || pricingDetailsBlock?.listExclude?.length > 0"
    fluid
    class="px-0"
  >
    <v-row
      justify="center"
      align="start"
      class="px-2 px-md-0"
    >
      <v-col
        cols="12"
        xs="7"
        class="text-h4 my-2 font-weight-bold "
      >
        {{ priceDetailsSection.title }}
      </v-col>
      <v-spacer />
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
        class="py-0"
      >
        <v-list
          role="list"
          :aria-label="`${priceDetailsSection.priceInclude} de ${priceDetailsSection.title}`"
        >
          <v-list-subheader class="text-subtitle-1 pt-md-4 d-flex justify-center justify-md-start custom-padding">
            <v-chip
              variant="flat"
              color="green"
            >
              <span class="font-weight-bold px-1 pb-1">
                {{ priceDetailsSection.priceInclude }}
              </span>
            </v-chip>
          </v-list-subheader>
          <div
            :ref="(el) => { include.content.value = el }"
            :class="{ 'truncated': include.shouldTruncate.value && !include.isExpanded.value, 'price-content': include.shouldTruncate.value }"
            :style="include.shouldTruncate.value ? include.contentStyle.value : {}"
          >
            <v-container class="px-md-0">
              <EnrichedText
                class="custom-include-list-item"
                :value="pricingDetailsBlock.listInclude"
                :list-aria-attributes="{
                  'role': 'list',
                  'aria-label': `${priceDetailsSection.priceInclude} de ${priceDetailsSection.title}`,
                }"
                :list-item-aria-attributes="(index) => ({
                  'role': 'listitem',
                  'aria-label': `Item ${index + 1} de ${priceDetailsSection.priceInclude}`,
                })"
              />
            </v-container>
          </div>
          <div v-if="include.shouldTruncate.value">
            <v-btn
              variant="text"
              width="fit-content"
              class="text-body-2 text-md-body-1 d-flex justify-start align-center pl-0"
              @click="include.toggle"
            >
              {{ include.isExpanded.value ? 'Voir moins' : 'Voir plus' }}
              <v-icon
                :icon="mdiArrowRight"
                color="primary"
                class="mt-1"
                :class="include.isExpanded.value ? 'rotate-180' : ''"
              />
            </v-btn>
          </div>
        </v-list>
      </v-col>
      <v-col
        cols="12"
        md="6"
        class="py-0"
      >
        <v-list
          class="pl-md-4"
          role="list"
          :aria-label="`${priceDetailsSection.priceExclude} de ${priceDetailsSection.title}`"
        >
          <v-list-subheader class="text-subtitle-1 pt-md-4 d-flex justify-center justify-md-start custom-padding">
            <v-chip
              variant="flat"
              color="secondary"
            >
              <span class="font-weight-bold px-1 pb-1">
                {{ priceDetailsSection.priceExclude }}
              </span>
            </v-chip>
          </v-list-subheader>
          <div
            :ref="(el) => { exclude.content.value = el }"
            :class="{ 'truncated': exclude.shouldTruncate.value && !exclude.isExpanded.value, 'price-content': exclude.shouldTruncate.value }"
            :style="exclude.shouldTruncate.value ? exclude.contentStyle.value : {}"
          >
            <v-container class="px-md-0">
              <EnrichedText
                class="custom-exclude-list-item"
                :value="pricingDetailsBlock.listExclude"
                :list-aria-attributes="{
                  'role': 'list',
                  'aria-label': `${priceDetailsSection.priceExclude} de ${priceDetailsSection.title}`,
                }"
                :list-item-aria-attributes="(index) => ({
                  'role': 'listitem',
                  'aria-label': `Item ${index + 1} de ${priceDetailsSection.priceExclude}`,
                })"
              />
            </v-container>
          </div>
          <div v-if="exclude.shouldTruncate.value">
            <v-btn
              variant="text"
              width="fit-content"
              class="text-body-2 text-md-body-1 d-flex justify-start align-center pl-0"
              @click="exclude.toggle"
            >
              {{ exclude.isExpanded.value ? 'Voir moins' : 'Voir plus' }}
              <v-icon
                :icon="mdiArrowRight"
                color="primary"
                class="mt-1"
                :class="exclude.isExpanded.value ? 'rotate-180' : ''"
              />
            </v-btn>
          </div>
        </v-list>
      </v-col>
    </v-row>

    <v-divider class="my-2 my-md-6" />
  </v-container>
</template>

<script setup>
import { mdiArrowRight } from '@mdi/js'

const ITEM_LIMIT = 3
const ITEM_HEIGHT = 25 // px per list item (line-height + margin)
const SUBHEADER_HEIGHT = 60 // px for the chip subheader
const clampHeight = SUBHEADER_HEIGHT + ITEM_LIMIT * ITEM_HEIGHT

const props = defineProps({
  pricingDetailsBlock: {
    type: Object,
    default: undefined,
  },
  priceDetailsSection: {
    type: Object,
    required: true,
  },
})

const { readScrollHeight } = useLayoutRead()

const countListItems = (blocks) => {
  if (!blocks) return 0
  return blocks.filter(block => block.listItem).length
}

const useListTruncation = (getBlocks) => {
  const isExpanded = ref(false)
  const content = ref(null)
  const shouldTruncate = computed(() => countListItems(getBlocks()) > ITEM_LIMIT)
  const contentStyle = ref({
    maxHeight: `${clampHeight}px`,
    overflow: 'hidden',
    transition: 'max-height 0.5s ease',
  })

  const toggle = () => {
    isExpanded.value = !isExpanded.value
  }

  watch(isExpanded, async (newVal) => {
    if (import.meta.client && content.value) {
      await nextTick()
      if (newVal) {
        const scrollHeight = await readScrollHeight(content.value)
        contentStyle.value.maxHeight = scrollHeight + 'px'
      }
      else {
        contentStyle.value.maxHeight = `${clampHeight}px`
      }
    }
  })

  onMounted(() => {
    if (shouldTruncate.value && !isExpanded.value) {
      contentStyle.value.maxHeight = `${clampHeight}px`
    }
  })

  return { isExpanded, content, shouldTruncate, contentStyle, toggle }
}

const include = useListTruncation(() => props.pricingDetailsBlock?.listInclude)
const exclude = useListTruncation(() => props.pricingDetailsBlock?.listExclude)
</script>

<style scoped>
.custom-padding {
  padding-inline: 0 !important;
}
.custom-include-list-item:deep(ul) {
  list-style: none!important;
  margin-left: 0;
  padding-left: 1.2em;
}
.custom-exclude-list-item:deep(ul) {
  list-style: none!important;
  margin-left: 0.1em;
  padding-left: 1.2em;
}
.custom-include-list-item:deep(ul li:before) {
  content: url('/assets/include.svg') !important;
  position: absolute;
  left: 0;
  margin-top: 0.2em!important;
}
.custom-exclude-list-item:deep(ul li:before) {
  content: url('/assets/exclude.svg') !important;
  position: absolute;
  left: 0px;
}
.custom-exclude-list-item:deep(ul li), .custom-include-list-item:deep(ul li) {
  margin-left: 0.8em;
}
.price-content {
  overflow: hidden;
  transition: max-height 0.5s ease;
  position: relative;
}
.price-content.truncated::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3em;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
}
.rotate-180 {
  transform: rotate(180deg);
}
</style>
