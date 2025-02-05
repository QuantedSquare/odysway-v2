const deal = ref(null)
const dealId = ref(null)
export function useDeal() {
  const fetchDeal = async () => {
    const res = await apiRequest(`/ac/deals/${dealId.value}`)
    deal.value = res
  }
  const createDeal = async (deal) => {
    const res = await apiRequest('/ac/deals', 'post', deal)
    dealId.value = res
  }
  const updateDeal = async (deal) => {
    console.log('Updating deal:', deal)

    const res = await apiRequest('/ac/deals/' + dealId.value, 'post', deal)
    dealId.value = res
  }

  return { deal, dealId, fetchDeal, createDeal, updateDeal }
}
