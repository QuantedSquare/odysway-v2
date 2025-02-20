import addAnotherParameter from '@/utils/addAnotherParameter'

export function useDeal(componentStep) {
  const deal = ref(null)
  const dealId = ref(null)
  const route = useRoute()

  const currentStepRef = ref(1)

  const fetchDeal = async (id = dealId.value) => {
    const res = await apiRequest(`/ac/deals/${id}`)
    deal.value = res
  }

  const createDeal = async (body) => {
    const res = await apiRequest('/ac/deals', 'post', body)
    dealId.value = res
    addAnotherParameter('id', dealId.value)
    return true
  }

  const updateDeal = async (body) => {
    const res = await apiRequest('/ac/deals/' + dealId.value, 'post', body)
    dealId.value = res

    return true
  }

  watch(route, () => {
    dealId.value = route.query.id || dealId.value
    console.log('dealId', dealId.value, 'route.query.currentStep', route.query.currentStep)
    if (route.query.currentStep) {
      currentStepRef.value = route.query.currentStep
    }
  }, { immediate: true })

  watch([dealId, currentStepRef], async () => {
    dealId.value = route.query.id || dealId.value
    if (dealId.value && +componentStep === +currentStepRef.value) {
      await fetchDeal()
      console.log('Deal fetched:', deal.value)
    }
  }, { immediate: true })

  return { deal, dealId, fetchDeal, createDeal, updateDeal }
}
