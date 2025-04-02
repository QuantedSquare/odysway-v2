import determinePaymentOptions from '@/utils/determinePaymentOptions'
import { useSecureUrl } from './useSecureUrl'

export function useStepperDeal(componentStep) {
  const deal = ref(null)
  const dealId = ref(null)
  const route = useRoute()
  const { addSingleParam } = useParams()
  const { generateSecureUrl, validateSecureUrl } = useSecureUrl()

  const currentStepRef = ref(1)

  const fetchDeal = async (id = dealId.value) => {
    const res = await apiRequest(`/ac/deals/${id}`)
    deal.value = res
  }

  const checkoutType = computed(() => {
    if (deal.value) {
      return determinePaymentOptions(deal.value.departureDate, route.query)
    }
    else if (route.query.departure_date) {
      return determinePaymentOptions(route.query.departure_date, route.query)
    }
  })

  const createDeal = async (body) => {
    const res = await apiRequest('/ac/deals', 'post', body)
    dealId.value = res
    
    // Generate secure URL with encrypted dealId
    const secureUrl = await generateSecureUrl({ dealId: res }, ['dealId'])
    
    // Extract the secure parameter from the URL string
    const secureMatch = secureUrl.match(/secure=([^&]+)/)
    if (secureMatch) {
      addSingleParam('secure', secureMatch[1])
    }
    
    return true
  }

  const updateDeal = async (body) => {
    const res = await apiRequest('/ac/deals/' + dealId.value, 'post', body)
    dealId.value = res

    // Generate secure URL with encrypted dealId
    const secureUrl = await generateSecureUrl({ dealId: res }, ['dealId'])
    
    // Extract the secure parameter from the URL string
    const secureMatch = secureUrl.match(/secure=([^&]+)/)
    if (secureMatch) {
      addSingleParam('secure', secureMatch[1])
    }

    return true
  }

  // Watch for route changes and handle secure dealId
  watch(route, async () => {
    if (route.query.secure) {
      try {
        const payload = await validateSecureUrl(route.query.secure)
        dealId.value = payload.dealId
      } catch (error) {
        console.error('Failed to validate secure dealId:', error)
      }
    }

    if (route.query.step) {
      currentStepRef.value = route.query.step
    }
  }, { immediate: true })

  watch([dealId, currentStepRef], async () => {
    if (dealId.value && +componentStep === +currentStepRef.value) {
      await fetchDeal()
      console.log('Deal fetched:', deal.value)
    }
  }, { immediate: true })

  return { deal, dealId, fetchDeal, createDeal, updateDeal, checkoutType }
}
