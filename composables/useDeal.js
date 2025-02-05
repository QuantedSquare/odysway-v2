export function useDeal() {
  const deal = ref(null)
  const dealId = ref('11269')

  const fetchDeal = async () => {
    const res = await apiRequest(`/ac/deals/${dealId.value}`)
    console.log('API Response from fetchDeal:', res)
    deal.value = res
  }
  const createDeal = async (deal) => {
    const res = await apiRequest('/ac/deals', 'post', deal)
    console.log('API Response from createDeal:', res)
  }

  return { deal, fetchDeal }
}
