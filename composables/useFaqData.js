/**
 * Composable to fetch and provide FAQ data
 * Used for both displaying FAQs and generating FAQ structured data
 *
 * @param {Object} options - Configuration options
 * @param {Boolean} options.includeHidden - Include hidden FAQs (default: false)
 * @param {Number} options.limit - Limit number of FAQs returned
 * @returns {Object} FAQ data and utilities
 */
export async function useFaqData(options = {}) {
  const {
    includeHidden = false,
    limit = null,
  } = options

  const faqQuery = groq`*[_type == "faq"][0]{ ... }`
  const sanity = useSanity()

  const { data: faqData } = await useAsyncData(
    'faq-data',
    async () => {
      try {
        const result = await sanity.fetch(faqQuery)
        return result || null
      }
      catch (e) {
        console.error('Error fetching FAQ data:', e)
        return null
      }
    },
    {
      server: true,
    },
  )

  /**
   * Get FAQs formatted for structured data (Schema.org)
   * Filters out hidden FAQs unless includeHidden is true
   */
  const getFaqsForSchema = computed(() => {
    if (!faqData.value?.faqItems) return []

    let items = faqData.value.faqItems

    // Filter hidden items unless includeHidden is true
    if (!includeHidden) {
      items = items.filter(item => !item.hide)
    }

    // Apply limit if specified
    if (limit && limit > 0) {
      items = items.slice(0, limit)
    }

    // Return in format expected by createFAQPageSchema
    return items.map(item => ({
      question: item.question,
      answer: item.answer, // Portable Text array
    }))
  })

  return {
    faqData,
    getFaqsForSchema,
  }
}
