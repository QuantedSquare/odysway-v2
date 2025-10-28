import { useMemoize } from '@vueuse/core'
import { ref } from 'vue'

const memoizedSearch = useMemoize(async (searchText) => {
  const searchResult = await apiRequest(`/search/voyages?keyword=${searchText}`)
  return { searchResult }
})

export function useTravelsSearch() {
  const destinations = ref([])
  const loading = ref(true)

  async function handleSearch(searchText) {
    const searchTerm = searchText?.trim().toLowerCase()

    try {
      const { searchResult } = await memoizedSearch(searchTerm)
      destinations.value = searchResult
    }
    catch (error) {
      console.error('Search failed:', error)
      destinations.value = []
    }
    finally {
      loading.value = false
    }
  }

  return {
    destinations,
    loading,
    handleSearch,
  }
}
