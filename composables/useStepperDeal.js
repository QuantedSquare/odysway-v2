import determinePaymentOptions from '@/utils/determinePaymentOptions'

export function useStepperDeal(componentStep) {
  const deal = ref(null)

  const dealId = ref(null)
  const loadingDeal = ref(false)
  const route = useRoute()
  const { addMultipleParams } = useParams()

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
        booked_places: 0, // this value is updated after a payment
      })
      dealId.value = addedBookedDate.deal_id
      localStorage.setItem(date_id, JSON.stringify({
        booked_id: addedBookedDate.id,
        deal_id: addedBookedDate.deal_id,
      }))

      const paiementLink = `https://odysway.com/checkout?type=${route.query.type}&booked_id=${addedBookedDate.id}&step=1`
      const bodyWithPaymentLink = {
        dealId: addedBookedDate.deal_id,
        paiementLink,
      }
      await addMultipleParams({
        booked_id: addedBookedDate.id,
        date_id: undefined, // This will remove the date_id parameter
      })
      updateDeal(bodyWithPaymentLink) // Update the deal with a paiementLink

      return true
    }
    catch (error) {
      console.error('Error creating deal:', error)
      return false
    }
  }

  const updateDeal = (body) => {
    apiRequest('/ac/deals/update-with-bms?bookedId=' + route.query.booked_id, 'post', body)
  }

  return { deal, dealId, fetchDeal, createDeal, updateDeal, checkoutType, loadingDeal }
}
