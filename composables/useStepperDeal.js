import addAnotherQuery from '@/utils/addAnotherQuery'
import determinePaymentOptions from '@/utils/determinePaymentOptions'

export function useStepperDeal(componentStep) {
  const deal = ref(null)
  const dealId = ref(null)
  const route = useRoute()

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
    addAnotherQuery('dealId', dealId.value)
    return true
  }

  const updateDeal = async (body) => {
    const res = await apiRequest('/ac/deals/' + dealId.value, 'post', body)
    dealId.value = res

    return true
  }

  watch(route, () => {
    dealId.value = route.query.dealId || dealId.value
    if (route.query.step) {
      currentStepRef.value = route.query.step
    }
  }, { immediate: true })

  watch([dealId, currentStepRef], async () => {
    dealId.value = route.query.dealId || dealId.value
    if (dealId.value && +componentStep === +currentStepRef.value) {
      await fetchDeal()
      console.log('Deal fetched:', deal.value)
    }
  }, { immediate: true })

  return { deal, dealId, fetchDeal, createDeal, updateDeal, checkoutType }
}
