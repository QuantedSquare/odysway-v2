<template>
  <div :class="wrapperClass">
    <!-- <div
      ref="textContent"
      class="text-content"
      :class="{ truncated: !isExpanded && showReadMore }"
      :style="contentStyle"
    > -->
      <slot />
    <!-- </div> -->

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
const showReadMore = ref(false)
const fullScrollHeight = ref(0)

// Start with a very large max-height to allow natural sizing for initial measurement
// This prevents forced reflows when we read scrollHeight
const contentStyle = ref({
  maxHeight: '9999px', // Large enough to not constrain, but allows overflow: hidden
  overflow: 'hidden',
  transition: 'max-height 0.5s ease',
})

// Read and cache the full scrollHeight once on mount
// This is the ONLY time we read scrollHeight - we cache it for all future use
onMounted(() => {
  if (!textContent.value) return
  
  // Read scrollHeight in the next animation frame
  // This batches with other layout operations during page load
  requestAnimationFrame(() => {
    if (textContent.value) {
      // Single read during natural page load - this is acceptable
      fullScrollHeight.value = textContent.value.scrollHeight
      showReadMore.value = fullScrollHeight.value > props.lineHeight * props.clampLines
      
      // Now apply the actual constraint using the cached value
      // No layout read happens here - we're just setting a style
      if (showReadMore.value) {
        contentStyle.value.maxHeight = `${props.lineHeight * props.clampLines}px`
      }
    }
  })
})

watch(isExpanded, (newVal) => {
  if (!textContent.value) return

  // Use the cached scrollHeight instead of reading it after DOM changes
  // This prevents forced reflows
  if (newVal) {
    // Use cached value - no layout read needed
    contentStyle.value.maxHeight = fullScrollHeight.value + 'px'
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
