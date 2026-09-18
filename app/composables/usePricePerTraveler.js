export function usePricePerTraveler(dynamicDealValues, voyage) {
  const calculatePricePerPerson = (data, voyage) => {
    // Les v-select peuvent rendre des chaînes : "1" + 0 donnait "10".
    const nbTravelers = (+data.nbAdults || 0) + (+data.nbChildren || 0)
    if (!nbTravelers) return NaN
    const { startingPrice, flightPrice = 0, extensionPrice = 0, promoChildren = 0, nbChildren = 0, promoTeen = 0, nbTeen = 0, earlybirdAvailable = 'Non', promoEarlybird = 0, lastMinuteAvailable = 'Non', promoLastMinute = 0, promoValue = 0 } = voyage
    let price = (startingPrice) * nbTravelers
    price += flightPrice * nbTravelers

    price += extensionPrice * nbTravelers

    if (promoChildren && nbChildren) {
      price -= promoChildren * nbChildren
    }

    if (promoTeen && nbTeen) {
      price -= promoTeen * nbTeen
    }

    if (earlybirdAvailable === 'Oui' && promoEarlybird) {
      price -= promoEarlybird * nbTravelers
    }

    if (lastMinuteAvailable === 'Oui' && promoLastMinute) {
      price -= lastMinuteAvailable * promoLastMinute * nbTravelers
    }

    if (promoValue) {
      price -= promoValue * nbTravelers
    }

    return Math.ceil(price / nbTravelers)
  }

  const pricePerTraveler = computed(() => {
    // Only log and calculate when both values are available
    if (!dynamicDealValues.value || !voyage) {
      return 0
    }

    return calculatePricePerPerson(dynamicDealValues.value, voyage)
  })

  return { pricePerTraveler, calculatePricePerPerson }
}
