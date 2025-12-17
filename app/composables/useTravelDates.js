import { computed, unref } from 'vue'

export function useTravelDates(slugsInput) {
  const slugs = computed(() => {
    const list = Array.isArray(unref(slugsInput)) ? unref(slugsInput) : []
    return [...new Set(list.filter(Boolean))]
  })

  const shouldFetch = computed(() => slugs.value.length > 0)

  const { data, pending, error } = useAsyncData(
    () => `travel-dates-${slugs.value.join(',')}`,
    () => shouldFetch.value
      ? $fetch('/api/v1/booking/travel-dates', {
          params: { slugs: slugs.value.join(',') },
        })
      : [],
    {
      watch: [slugs],
      server: true,
      immediate: true,
      dedupe: 'defer',
    },
  )

  const datesBySlug = computed(() => {
    const map = {}
    const list = data.value || []
    list.forEach((date) => {
      const slug = date.travel_slug
      if (!slug) return
      if (!map[slug]) map[slug] = []
      map[slug].push(date)
    })
    // Sort per slug by departure_date asc
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date))
    })
    return map
  })

  return {
    datesBySlug,
    isLoading: pending,
    error,
  }
}
