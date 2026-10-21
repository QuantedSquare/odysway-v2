export function useDates() {
  const route = useRoute()
  const dates = ref([])
  // Vrai jusqu'à la réponse : le HTML rendu côté serveur montre un squelette, pas
  // « aucun départ » (les dates ne sont chargées qu'au montage).
  const isLoading = ref(true)

  const getDates = async () => {
    isLoading.value = true
    try {
      const res = await apiRequest(`/booking/${route.params.voyageSlug}/dates`)
      dates.value = res?.filter(date => date.published) || []
    }
    catch {
      dates.value = []
    }
    finally {
      isLoading.value = false
    }
  }

  // watch(route, () => {
  //   getDates()
  // }, { immediate: true })
  onMounted(() => {
    if (route.params.voyageSlug) {
      getDates()
    }
    else {
      isLoading.value = false
    }
    return dates.value
  })

  return { dates, getDates, isLoading }
}
