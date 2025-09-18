import { useMemoize } from '@vueuse/core'
import { ref } from 'vue'

// Custom cache with a TTL (Time-To-Live) logic
const ttlCache = new Map()

const ttl = 1000 * 60 * 60 // 1 hour in milliseconds

const defaultCacheHandler = {
  get: (key) => {
    const item = ttlCache.get(key)
    if (item && Date.now() < item.expiry) {
      return item.value
    }
    ttlCache.delete(key) // Invalidate if expired
    return undefined
  },
  set: (key, value) => {
    ttlCache.set(key, { value, expiry: Date.now() + ttl })
  },
  has: (key) => {
    return defaultCacheHandler.get(key) !== undefined
  },
  delete: (key) => {
    ttlCache.delete(key)
  },
  clear: () => {
    ttlCache.clear()
  },
}

const memoizedDefaultData = useMemoize(async () => {
  const defaultResult = await apiRequest(`/search/voyages`)
  return { defaultResult }
}, {
  cache: defaultCacheHandler,
})

const memoizedSearch = useMemoize(async (searchText) => {
  const searchResult = await apiRequest(`/search/voyages?keyword=${searchText}`)
  return { searchResult }
}, {
  cache: defaultCacheHandler,
})

export function useTravelsSearch() {
  const destinations = ref([])
  const loading = ref(true)

  async function handleSearch(searchText) {
    const searchTerm = searchText?.trim()

    if (!searchTerm) {
      // Case 1: No input. Load and cache default data.
      const { defaultResult } = await memoizedDefaultData()
      destinations.value = defaultResult
      loading.value = false
      return
    }

    // Case 2: User is typing.
    try {
      const { searchResult } = await memoizedSearch(searchTerm)
      console.log('searchResult result ', searchResult)

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

  // Fetch default data on initial component load
  handleSearch('')

  return {
    destinations,
    loading,
    handleSearch,
  }
}
