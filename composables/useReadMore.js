export function useReadMore(clampLines = 3, lineHeight = 30) {
  const isExpanded = ref(false)
  const content = ref(null)
  const showReadMore = ref(false)

  const contentStyle = ref({
    maxHeight: `${lineHeight * clampLines}px`,
    overflow: 'hidden',
    transition: 'max-height 0.5s ease',
  })

  const toggleExpansion = () => {
    isExpanded.value = !isExpanded.value
  }

  const checkIfNeedsReadMore = () => {
    if (content.value) {
      const shouldShow = content.value.scrollHeight > lineHeight * clampLines
      showReadMore.value = shouldShow
    }
  }

  watch(isExpanded, async (newVal) => {
    await nextTick()
    if (newVal) {
      // Expanding: animate to full height
      contentStyle.value.maxHeight = content.value.scrollHeight + 'px'
    }
    else {
      // Collapsing: animate to clamped lines
      contentStyle.value.maxHeight = `${lineHeight * clampLines}px`
    }
  })

  onMounted(() => {
    // Check if content needs "Read more" button after content is rendered
    nextTick(() => {
      checkIfNeedsReadMore()
    })
  })

  return {
    isExpanded,
    content,
    showReadMore,
    contentStyle,
    toggleExpansion,
    checkIfNeedsReadMore,
  }
}
