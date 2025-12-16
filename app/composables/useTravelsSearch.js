import { useMemoize } from '@vueuse/core'
import { ref } from 'vue'

const memoizedSearch = useMemoize(async (searchText) => {
  const searchResult = await apiRequest(`/search/voyages?keyword=${searchText}`)
  return { searchResult }
})

const memoizedEmbededSearch = useMemoize(async (searchText, optout) => {
  const searchResult = await apiRequest(`/search/embedding-search?keyword=${searchText}&optout=${optout}`)
  return { searchResult }
})

// Minimum score threshold to filter out irrelevant results (0.7 = 70% relevance)
const SCORE_THRESHOLD = 0.7

async function handleEmbededSearch(searchText, destinations, loading, optout = false) {
  const searchTerm = searchText?.trim().toLowerCase()
  console.log('optout in embeded search', optout)
  // Don't search if empty
  if (!searchTerm) {
    destinations.value = []
    loading.value = false
    return []
  }

  loading.value = true

  try {
    const { searchResult } = await memoizedEmbededSearch(searchTerm, optout)
    console.log('searchResult', searchResult)

    // Filter by score threshold to exclude irrelevant results
    const filteredResults = searchResult.filter(result => result.score >= SCORE_THRESHOLD)

    destinations.value = filteredResults
    return filteredResults
  }
  catch (error) {
    console.error('Embeded search failed:', error)
    destinations.value = []
    return []
  }
  finally {
    loading.value = false
  }
}

export function useTravelsSearch() {
  const destinations = ref([])
  const loading = ref(false)

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
    handleEmbededSearch: (searchText, optout = false) => handleEmbededSearch(searchText, destinations, loading, optout),
  }
}
