export function useDates() {
  const route = useRoute()
  const dates = ref([])

  const getDates = async () => {
    const res = await apiRequest(`/booking/${route.params.voyageSlug}/dates`)
    dates.value = res.filter(date => date.published)
  }

  watch(route, () => {
    getDates()
  }, { immediate: true })

  return { dates, getDates }
}
