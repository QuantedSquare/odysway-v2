import determinePaymentOptions from '@/utils/determinePaymentOptions'

export function useStepperDeal() {
  const deal = useState('stepperDeal:deal', () => null)
  const dealId = useState('stepperDeal:dealId', () => null)
  const loadingDeal = useState('stepperDeal:loadingDeal', () => false)
  const bookedId = useState('stepperDeal:bookedId', () => null)
  const assignStatus = useState('stepperDeal:assignStatus', () => 'idle')
  const assignError = useState('stepperDeal:assignError', () => null)
  const pendingAssignPayload = useState('stepperDeal:pendingAssignPayload', () => null)

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

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

  const assignDealWithRetry = async ({ slug, dateId, dealIdToAssign, booked_places = 0, is_option, expiracy_date }, { maxAttempts = 3, baseDelayMs = 700 } = {}) => {
    assignStatus.value = 'assigning'
    assignError.value = null
    pendingAssignPayload.value = { slug, dateId, dealIdToAssign, booked_places, is_option, expiracy_date }

    let lastError = null
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const addedBookedDate = await apiRequest(`/booking/${slug}/date/${dateId}/assign-deal`, 'post', {
          dealId: dealIdToAssign,
          booked_places,
          is_option,
          expiracy_date,
        })

        dealId.value = addedBookedDate.deal_id
        bookedId.value = addedBookedDate.id
        localStorage.setItem(dateId, JSON.stringify({
          booked_id: addedBookedDate.id,
          deal_id: addedBookedDate.deal_id,
        }))

        await addMultipleParams({
          booked_id: addedBookedDate.id,
          date_id: undefined,
        })

        assignStatus.value = 'assigned'
        pendingAssignPayload.value = null

        return addedBookedDate
      }
      catch (error) {
        lastError = error
        if (attempt < maxAttempts) {
          await wait(baseDelayMs * attempt)
        }
      }
    }

    assignStatus.value = 'failed'
    assignError.value = lastError
    return null
  }

  const retryPendingAssign = async () => {
    if (!pendingAssignPayload.value) return null
    return await assignDealWithRetry(pendingAssignPayload.value)
  }

  const createDeal = async (body) => {
    try {
      const res = await apiRequest('/ac/deals', 'post', body)
      const date_id = route.query.date_id
      const addedBookedDate = await assignDealWithRetry({
        slug: body.slug,
        dateId: date_id,
        dealIdToAssign: res,
        booked_places: 0,
      })

      if (!addedBookedDate) return false

      const paiementLink = `https://odysway.com/checkout?type=${route.query.type}&booked_id=${addedBookedDate.id}&step=1`
      const bodyWithPaymentLink = {
        dealId: addedBookedDate.deal_id,
        paiementLink,
      }

      updateDeal(bodyWithPaymentLink).catch((error) => {
        console.error('Error updating deal with payment link:', error)
      })

      return true
    }
    catch (error) {
      console.error('Error creating deal:', error)
      assignStatus.value = 'failed'
      assignError.value = error
      return false
    }
  }

  const updateDeal = async (body) => {
    console.log('===========BODY IN UPDATE DEAL===========', body)
    const currentBookedId = route.query.booked_id || bookedId.value
    if (!currentBookedId) return false
    await apiRequest('/ac/deals/update-with-bms?bookedId=' + currentBookedId, 'post', body)
    return true
  }

  return {
    deal,
    dealId,
    bookedId,
    fetchDeal,
    createDeal,
    updateDeal,
    checkoutType,
    loadingDeal,
    assignStatus,
    assignError,
    retryPendingAssign,
  }
}
