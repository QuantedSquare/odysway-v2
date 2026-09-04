import { computed } from 'vue'

// Fetches the "Dernières places" voyages: the group departures that are still
// bookable, already have travellers on board and only have a few seats left
// (one entry per voyage, with the pushed departure attached as lastMinuteDate).
// Client-only + lazy like the other homepage carousels so it never blocks SSR.
//
// The selection is tuned in Sanity (homePage > Dernières places); pass a limit
// only to override the CMS value.
export function useLastMinuteVoyages(limit = null) {
  const { data } = useAsyncData(
    'last-minute-voyages',
    () => $fetch('/api/v1/booking/last-minute-voyages', limit ? { params: { limit } } : undefined),
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
