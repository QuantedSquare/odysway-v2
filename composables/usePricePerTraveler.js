export function usePricePerTraveler(deal) {
  const calculatePricePerPerson = (data) => {
    const { basePricePerTraveler, nbTravelers, flightPrice = 0, extensionPrice = 0, promoChildren = 0, nbChildren = 0, promoTeen = 0, nbTeen = 0, earlybirdAvailable = 'Non', promoEarlybird = 0, lastMinuteAvailable = 'Non', promoLastMinute = 0, promoValue = 0 } = data
    let price = (basePricePerTraveler) * nbTravelers

    price += flightPrice * nbTravelers

    price += extensionPrice * nbTravelers

    if (promoChildren && nbChildren) { price -= promoChildren * nbChildren }

    if (promoTeen && nbTeen) { price -= promoTeen * nbTeen }

    if (earlybirdAvailable === 'Oui' && promoEarlybird) { price -= earlybirdAvailable * promoEarlybird * nbTravelers }

    if (lastMinuteAvailable === 'Oui' && promoLastMinute) { price -= lastMinuteAvailable * promoLastMinute * nbTravelers }

    if (promoValue) { price -= promoValue * nbTravelers }

    return Math.ceil(price / nbTravelers)
  }

  const pricePerTraveler = computed(() => {
    if (!deal.value) return 0
    return calculatePricePerPerson(deal.value)
  })

  return { pricePerTraveler, calculatePricePerPerson }
}
