<template>
  <div ref="listContainer">
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  voyages: {
    type: Array,
    required: true,
  },
  listName: {
    type: String,
    required: true,
  },
})

const { trackViewItemList } = useGtmTracking()
const { formatVoyagesForGtm } = useGtmVoyageFormatter()

const listContainer = ref(null)
const hasTracked = ref(false)

onMounted(() => {
  // Use Intersection Observer to track when list becomes visible
  if (!listContainer.value || hasTracked.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasTracked.value) {
          // Track view_item_list when list is visible
          const formattedItems = formatVoyagesForGtm(props.voyages)
          trackViewItemList({
            currency: 'EUR',
            items: formattedItems,
            itemListName: props.listName,
          })
          hasTracked.value = true
          observer.disconnect()
        }
      })
    },
    {
      threshold: 0.1, // Trigger when 10% of the element is visible
    },
  )

  observer.observe(listContainer.value)

  // Cleanup
  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>
