export function useDates() {
  const route = useRoute()
  const dates = ref([])
  const isLoading = ref(false)

  const getDates = async () => {
    isLoading.value = true
    const res = await apiRequest(`/booking/${route.params.voyageSlug}/dates`)
    dates.value = res.filter(date => date.published)
    isLoading.value = false
  }

  watch(route, () => {
    getDates()
  }, { immediate: true })

  return { dates, getDates, isLoading }
}
