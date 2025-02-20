export function usePricePerTraveler(deal) {
  const pricePerTraveler = computed(() => {
    console.log('deal.value', deal.value)
    if (!deal.value) return 0
    return +deal.value?.basePricePerTraveler
  })

  return { pricePerTraveler }
}
