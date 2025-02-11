export function useDeal() {
  const deal = ref(null)
  const dealId = ref(null)
  const route = useRoute()
  watch(route, () => {
    dealId.value = route.query.id || null
  }, { immediate: true })

  const fetchDeal = async () => {
    const res = await apiRequest(`/ac/deals/${dealId.value}`)
    deal.value = res
  }
  const createDeal = async (body) => {
    console.log('Creating deal:', body)
    const res = await apiRequest('/ac/deals', 'post', body)
    return res // dealId
  }
  const updateDeal = async (body) => {
    console.log('Updating deal:', body, dealId.value)
    const res = await apiRequest('/ac/deals/' + dealId.value, 'post', body)
    dealId.value = res
  }

  return { deal, dealId, fetchDeal, createDeal, updateDeal }
}
