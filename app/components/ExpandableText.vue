<template>
  <div :class="wrapperClass">
    <div
      ref="textContent"
      class="text-content"
      :class="{ truncated: !isExpanded && showReadMore }"
      :style="contentStyle"
    >
      <slot />
    </div>

    <ReadMoreButton
      v-if="showReadMore"
      :is-expanded="isExpanded"
      :show-button="showReadMore"
      :button-class="buttonClass"
      :expanded-text="expandedText"
      :collapsed-text="collapsedText"
      @toggle="toggleExpansion"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  clampLines: {
    type: Number,
    default: 3,
  },
  lineHeight: {
    type: Number,
    default: 30,
  },
  wrapperClass: {
    type: String,
    default: 'text-wrapper',
  },
  buttonClass: {
    type: String,
    default: 'text-body-2 text-md-body-1',
  },
  expandedText: {
    type: String,
    default: 'Lire moins',
  },
  collapsedText: {
    type: String,
    default: 'Lire plus',
  },
})

const { readScrollHeight } = useLayoutRead()

const isExpanded = ref(false)
const textContent = ref(null)
const showReadMore = ref(false)

const clampHeight = props.lineHeight * props.clampLines

const contentStyle = ref({
  maxHeight: `${clampHeight}px`,
  overflow: 'hidden',
  transition: 'max-height 0.5s ease',
})

onMounted(async () => {
  if (!textContent.value) return
  const scrollHeight = await readScrollHeight(textContent.value)
  if (scrollHeight > clampHeight) {
    showReadMore.value = true
  }
  else if (scrollHeight > 0) {
    // Content fits within the clamp — remove the style so short content isn't clipped
    contentStyle.value = {}
  }
  // scrollHeight === 0 means layout not ready; leave clamp in place as safe fallback
})

watch(isExpanded, async (newVal) => {
  if (!textContent.value) return
  await nextTick()
  if (newVal) {
    const scrollHeight = await readScrollHeight(textContent.value)
    contentStyle.value = { maxHeight: scrollHeight + 'px', overflow: 'hidden', transition: 'max-height 0.5s ease' }
  }
  else {
    contentStyle.value = { maxHeight: `${clampHeight}px`, overflow: 'hidden', transition: 'max-height 0.5s ease' }
  }
})

const toggleExpansion = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.text-wrapper {
  position: relative;
  width: 100%;
}

.text-content {
  overflow: hidden;
  transition: max-height 0.5s ease;
  position: relative;
  line-height: 1.5;
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
</style>
