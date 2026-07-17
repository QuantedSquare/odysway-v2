import { computed } from 'vue'

// Fetches the "Dernières places" voyages: those whose next bookable departure is
// the closest in time and still has seats left (one entry per voyage). Client-only
// + lazy like the other homepage carousels so it never blocks SSR.
export function useLastMinuteVoyages(limit = 12) {
  const { data } = useAsyncData(
    'last-minute-voyages',
    () => $fetch('/api/v1/booking/last-minute-voyages', { params: { limit } }),
    {
      server: false,
      lazy: true,
      immediate: true,
      dedupe: 'defer',
    },
  )

  const lastMinuteVoyages = computed(() => data.value || [])

  return { lastMinuteVoyages }
}
