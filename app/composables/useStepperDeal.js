import determinePaymentOptions from '@/utils/determinePaymentOptions'

export function useStepperDeal() {
  const deal = useState('stepperDeal:deal', () => null)
  const dealId = useState('stepperDeal:dealId', () => null)
  const loadingDeal = useState('stepperDeal:loadingDeal', () => false)
  const bookedId = useState('stepperDeal:bookedId', () => null)
  const kickstartLoading = useState('stepperDeal:kickstartLoading', () => false)
  const pendingUpdates = useState('stepperDeal:pendingUpdates', () => [])
  const assignStatus = useState('stepperDeal:assignStatus', () => 'idle')
  const assignError = useState('stepperDeal:assignError', () => null)
  const pendingAssignPayload = useState('stepperDeal:pendingAssignPayload', () => null)

  const route = useRoute()
  const { addMultipleParams } = useParams()
  const { report, reportApiError, setContext } = useFunnelReporter()

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

  const assignDealWithRetry = async ({ slug, dateId, dealIdToAssign, booked_places = 0, is_option, expiracy_date, nbTravelers, alreadyPaid }, { maxAttempts = 3, baseDelayMs = 700 } = {}) => {
    assignStatus.value = 'assigning'
    assignError.value = null
    pendingAssignPayload.value = { slug, dateId, dealIdToAssign, booked_places, is_option, expiracy_date, nbTravelers, alreadyPaid }

    let lastError = null
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const addedBookedDate = await apiRequest(`/booking/${slug}/date/${dateId}/assign-deal`, 'post', {
          dealId: dealIdToAssign,
          booked_places,
          is_option,
          expiracy_date,
          nbTravelers,
          alreadyPaid,
        })

        dealId.value = addedBookedDate.deal_id
        bookedId.value = addedBookedDate.id
        setContext({ dealId: addedBookedDate.deal_id, bookedId: addedBookedDate.id, dateId })
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
    reportApiError(lastError, {
      code: 'ASSIGN_DEAL_EXHAUSTED',
      step: 'details',
      origin: { endpoint: `/booking/${slug}/date/${dateId}/assign-deal` },
      message: `assign-deal failed after ${maxAttempts} attempts (dealId=${dealIdToAssign}, nbTravelers=${nbTravelers})`,
    })
    return null
  }

  const retryPendingAssign = async () => {
    if (!pendingAssignPayload.value) return null
    return await assignDealWithRetry(pendingAssignPayload.value)
  }

  const createDeal = async (body) => {
    try {
      const res = await apiRequest('/ac/deals', 'post', body)
      setContext({ dealId: res, email: body?.email, voyageSlug: body?.slug })
      const date_id = route.query.date_id
      const addedBookedDate = await assignDealWithRetry({
        slug: body.slug,
        dateId: date_id,
        dealIdToAssign: res,
        booked_places: 0,
        nbTravelers: body.nbTravelers,
        alreadyPaid: 0,
      })

      if (!addedBookedDate) return false

      const paiementLink = `https://odysway.com/checkout?type=${route.query.type}&booked_id=${addedBookedDate.id}&step=1`
      const bodyWithPaymentLink = {
        dealId: addedBookedDate.deal_id,
        paiementLink,
      }

      updateDeal(bodyWithPaymentLink, addedBookedDate.id).catch((error) => {
        console.error('Error updating deal with payment link:', error)
      })

      return true
    }
    catch (error) {
      console.error('Error creating deal:', error)
      assignStatus.value = 'failed'
      assignError.value = error
      reportApiError(error, {
        code: 'CREATE_DEAL_FAILED',
        step: 'details',
        origin: { endpoint: '/ac/deals' },
        message: 'Échec de création du deal ActiveCampaign',
      })
      return false
    }
  }

  const kickstartDeal = async (body, slug, dateId) => {
    kickstartLoading.value = true
    try {
      const res = await apiRequest(`/booking/${slug}/date/${dateId}/kickstart`, 'post', body)
      dealId.value = res.dealId
      bookedId.value = res.bookedId
      setContext({ dealId: res.dealId, bookedId: res.bookedId, dateId, voyageSlug: slug, email: body?.email })
      localStorage.setItem(dateId, JSON.stringify({ booked_id: res.bookedId, deal_id: res.dealId }))
      addMultipleParams({ booked_id: res.bookedId, date_id: undefined })
      // Flush any updateDeal calls that arrived before bookedId was set
      if (pendingUpdates.value.length > 0) {
        const toFlush = [...pendingUpdates.value]
        pendingUpdates.value = []
        toFlush.forEach(pendingBody =>
          apiRequest('/ac/deals/update-with-bms?bookedId=' + res.bookedId, 'post', pendingBody).catch(console.error),
        )
      }
      return res
    }
    catch (error) {
      reportApiError(error, {
        code: 'KICKSTART_FAILED',
        step: 'details',
        origin: { endpoint: `/booking/${slug}/date/${dateId}/kickstart` },
        message: 'Échec du kickstart deal',
      })
      throw error
    }
    finally {
      kickstartLoading.value = false
    }
  }

  const updateDeal = async (body, explicitBookedId) => {
    const currentBookedId = explicitBookedId || route.query.booked_id || bookedId.value
    if (!currentBookedId) {
      pendingUpdates.value.push(body)
      report({
        code: 'UPDATE_DEAL_QUEUED_NO_BOOKED_ID',
        step: 'unknown',
        severity: 'warning',
        origin: { field: 'bookedId', received: null },
        message: 'updateDeal appelé sans bookedId — mise en file d\'attente',
      })
      return false
    }
    await apiRequest('/ac/deals/update-with-bms?bookedId=' + currentBookedId, 'post', body)
    return true
  }

  return {
    deal,
    dealId,
    bookedId,
    kickstartLoading,
    fetchDeal,
    createDeal,
    kickstartDeal,
    updateDeal,
    checkoutType,
    loadingDeal,
    assignStatus,
    assignError,
    retryPendingAssign,
  }
}
