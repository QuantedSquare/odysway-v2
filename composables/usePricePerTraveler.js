export function usePricePerTraveler(dynamicDealValues, voyage) {
  const calculatePricePerPerson = (data, voyage) => {
    console.log('data', data, voyage)
    const nbTravelers = data.nbAdults + data.nbChildren
    const { startingPrice, flightPrice = 0, extensionPrice = 0, promoChildren = 0, nbChildren = 0, promoTeen = 0, nbTeen = 0, earlybirdAvailable = 'Non', promoEarlybird = 0, lastMinuteAvailable = 'Non', promoLastMinute = 0, promoValue = 0 } = voyage
    let price = (startingPrice) * nbTravelers
    console.log('price', price, nbTravelers, startingPrice, flightPrice, extensionPrice, promoChildren, nbChildren, promoTeen, nbTeen, earlybirdAvailable, promoEarlybird, lastMinuteAvailable, promoLastMinute, promoValue)
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
