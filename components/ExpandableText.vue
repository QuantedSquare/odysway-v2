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
    default: 'text-h5 pa-0',
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

const isExpanded = ref(false)
const textContent = ref(null)

const showReadMore = computed(() => {
  if (!textContent.value) return false
  return textContent.value.scrollHeight > props.lineHeight * props.clampLines
})

const contentStyle = ref({
  maxHeight: `${props.lineHeight * props.clampLines}px`,
  overflow: 'hidden',
  transition: 'max-height 0.5s ease',
})

watch(isExpanded, async (newVal) => {
  if (!textContent.value) return

  await nextTick()
  if (newVal) {
    contentStyle.value.maxHeight = textContent.value.scrollHeight + 'px'
  }
  else {
    contentStyle.value.maxHeight = `${props.lineHeight * props.clampLines}px`
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
