export function useDates() {
  const route = useRoute()
  const dates = ref([])

  const getDates = async () => {
    const res = await apiRequest(`/booking/${route.params.voyageSlug}/dates`)
    console.log('dates fetched', res)
    dates.value = res
  }

  watch(route, () => {
    getDates()
  }, { immediate: true })

  return { dates, getDates }
}
