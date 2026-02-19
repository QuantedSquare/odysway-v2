<template>
  <div ref="carouselContainer">
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

const carouselContainer = ref(null)
const hasTracked = ref(false)

onMounted(() => {
  if (!carouselContainer.value || hasTracked.value) return
  if (!props.voyages || props.voyages.length === 0) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasTracked.value) {
          const formattedItems = formatVoyagesForGtm(props.voyages)

          if (formattedItems && formattedItems.length > 0) {
            trackViewItemList({
              currency: 'EUR',
              items: formattedItems,
              itemListName: props.listName,
            })
          }

          hasTracked.value = true
          observer.disconnect()
        }
      })
    },
    {
      threshold: 0.1, // Trigger when 10% of the element is visible
    },
  )

  observer.observe(carouselContainer.value)

  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>
