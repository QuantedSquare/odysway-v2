<template>
  <div>
    <div
      ref="content"
      :class="{ 'truncated': shouldTruncate && !isExpanded, 'text-content': shouldTruncate }"
      :style="shouldTruncate ? contentStyle : {}"
    >
      <div v-if="housingType">
        <span class="font-weight-bold text-no-wrap">{{ housingTypeTitle }}:</span>
        {{ housingType }}
      </div>
      <div v-if="housingMood?.length > 0">
        <span class="font-weight-bold text-no-wrap">{{ housingMoodTitle }}:</span>
        <EnrichedText :value="housingMood" />
      </div>
    </div>
    <div v-if="shouldTruncate">
      <v-btn
        variant="text"
        width="fit-content"
        class="text-body-2 text-md-body-1 d-flex justify-start align-center pl-0"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? 'Voir moins' : 'Voir plus' }}
        <v-icon
          :icon="mdiArrowRight"
          color="primary"
          class="mt-1"
          :class="isExpanded ? 'rotate-180' : ''"
        />
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { mdiArrowRight } from '@mdi/js'
import { getPortableTextLength } from '~/utils/getPortableTextLength'

const props = defineProps({
  housingType: {
    type: String,
    default: '',
  },
  housingMood: {
    type: Array,
    default: () => [],
  },
  housingTypeTitle: {
    type: [String, Array],
    required: true,
  },
  housingMoodTitle: {
    type: [String, Array],
    required: true,
  },
})

const { readScrollHeight } = useLayoutRead()
const isExpanded = ref(false)
const content = ref(null)
const clampHeight = 120 // 4 lignes × 30px

const shouldTruncate = computed(() => {
  const typeChars = props.housingType?.length || 0
  const moodChars = getPortableTextLength(props.housingMood)
  return typeChars + moodChars > 150
})

const contentStyle = ref({
  maxHeight: `${clampHeight}px`,
  overflow: 'hidden',
  transition: 'max-height 0.5s ease',
})

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
</script>

<style scoped>
.text-content {
  overflow: hidden;
  transition: max-height 0.5s ease;
  position: relative;
}
.text-content.truncated::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2em;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
}
.rotate-180 {
  transform: rotate(180deg);
}
</style>
