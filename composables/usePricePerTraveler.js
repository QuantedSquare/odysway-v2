export function usePricePerTraveler(deal) {
  const pricePerTraveler = computed(() => {
    console.log('deal.value', deal.value)
    // #TODO MODIFIER CE CALCUL
    if (!deal.value) return 0
    return +deal.value?.basePricePerTraveler
  })

  return { pricePerTraveler }
}
