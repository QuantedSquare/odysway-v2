import { createClient } from '@sanity/client'

/**
 * Composable for switching between Sanity datasets dynamically
 *
 * Usage:
 * const { dataset, setDataset, sanityClient } = useSanityDataset()
 *
 * // Switch dataset
 * setDataset('staging') // or 'production'
 *
 * // Use the client
 * const data = await sanityClient.value.fetch(query)
 */
export function useSanityDataset() {
  const config = useRuntimeConfig()

  // State to hold the current dataset (default to the configured one)
  const currentDataset = useState('sanity-dataset', () =>
    config.public.sanity.dataset || 'production',
  )

  // Computed Sanity client that recreates when dataset changes
  const sanityClient = computed(() => {
    const clientConfig = {
      projectId: config.public.sanity.projectId,
      dataset: currentDataset.value,
      apiVersion: config.public.sanity.apiVersion,
      useCdn: false, // Disable CDN for instant updates when switching
      token: config.public.sanity.token, // If you need authenticated requests
      // perspective: 'published', // or 'previewDrafts' for preview mode
    }
    console.log('🔧 Creating Sanity client with config:', {
      projectId: clientConfig.projectId,
      dataset: clientConfig.dataset,
      apiVersion: clientConfig.apiVersion,
      hasToken: !!clientConfig.token,
    })
    return createClient(clientConfig)
  })

  // Helper function to switch datasets
  const setDataset = (newDataset) => {
    currentDataset.value = newDataset
  }

  // Helper function to fetch with current client
  const fetch = async (query, params = {}) => {
    try {
      console.log('📊 Fetching from dataset:', currentDataset.value)
      console.log('📝 Query:', query.substring(0, 200) + (query.length > 200 ? '...' : ''))
      console.log('🔍 Params:', params)

      const data = await sanityClient.value.fetch(query, params)

      console.log('✅ Data received:', data ? `${Array.isArray(data) ? data.length + ' items' : 'single item'}` : 'null')
      if (!data) {
        console.warn('⚠️ Query returned null/empty for dataset:', currentDataset.value)
      }

      return data
    }
    catch (error) {
      console.error('❌ Error fetching data from dataset:', currentDataset.value, error)
      throw error // Re-throw instead of returning null to see the actual error
    }
  }

  return {
    dataset: currentDataset,
    setDataset,
    sanityClient,
    fetch,
  }
}
