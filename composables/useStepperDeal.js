import determinePaymentOptions from '@/utils/determinePaymentOptions'

export function useStepperDeal(componentStep) {
  const deal = ref(null)
  const dealId = ref(null)
  const loadingDeal = ref(false)
  const route = useRoute()
  const { addMultipleParams } = useParams()

  const currentStepRef = ref(1)

  const fetchDeal = async (id = dealId.value) => {
    loadingDeal.value = true
    const res = await apiRequest(`/ac/deals/${id}`)
    deal.value = res
    loadingDeal.value = false
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
    try {
      const res = await apiRequest('/ac/deals', 'post', body)
      const date_id = route.query.date_id
      const addedBookedDate = await apiRequest(`/booking/${body.slug}/date/${date_id}/assign-deal`, 'post', {
        dealId: res,
        booked_places: 0, // this value is update after a payment
      })
      dealId.value = addedBookedDate.deal_id
      localStorage.setItem(date_id, JSON.stringify({
        booked_id: addedBookedDate.id,
        deal_id: addedBookedDate.deal_id,
      }))

      // Update both parameters at once to avoid race conditions
      await addMultipleParams({
        booked_id: addedBookedDate.id,
        date_id: undefined, // This will remove the date_id parameter
      })

      return true
    }
    catch (error) {
      console.error('Error creating deal:', error)
      return false
    }
  }

  const updateDeal = async (body) => {
    const res = await apiRequest('/ac/deals/' + dealId.value, 'post', body)
    dealId.value = res

    return true
  }

  watch(route, async () => {
    // dealId.value = route.query.dealId || dealId.value
    if (route.query.step) {
      currentStepRef.value = route.query.step
    }
    if (route.query.booked_id) {
      console.log('route.query.booked_id', route.query.booked_id)
      loadingDeal.value = true
      const { deal_id } = await apiRequest(`/booking/booked_date/${route.query.booked_id}`)
      console.log('deal_id in composable', deal_id)
      dealId.value = deal_id
      loadingDeal.value = false
    }
  }, { immediate: true })

  // #TODO CHECK SI CA FONCTIONNE SANS REFETCH
  watch([dealId, currentStepRef], async () => {
    if (dealId.value && +componentStep === +currentStepRef.value) {
      await fetchDeal()
      console.log('Deal fetched:', deal.value)
    }
  }, { immediate: true })

  return { deal, dealId, fetchDeal, createDeal, updateDeal, checkoutType, loadingDeal }
}
