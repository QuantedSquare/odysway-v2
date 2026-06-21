import { computed, unref } from 'vue'

// Fetches cumulated traveller counts per voyage slug for the best-sellers badge.
// Mirrors useTravelDates: client-only + lazy so it never blocks SSR (the badge
// is below the fold and the card renders fine without it).
export function useTravelersCount(slugsInput) {
  const slugs = computed(() => {
    const list = Array.isArray(unref(slugsInput)) ? unref(slugsInput) : []
    return [...new Set(list.filter(Boolean))]
  })

  const shouldFetch = computed(() => slugs.value.length > 0)

  const { data } = useAsyncData(
    () => `travelers-count-${slugs.value.join(',')}`,
    () => shouldFetch.value
      ? $fetch('/api/v1/booking/travelers-count', {
          params: { slugs: slugs.value.join(',') },
        })
      : {},
    {
      watch: [slugs],
      server: false,
      lazy: true,
      immediate: true,
      dedupe: 'defer',
    },
  )

  const countsBySlug = computed(() => data.value || {})

  return { countsBySlug }
}
