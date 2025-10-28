export default function (data, voyage) {
  console.log('data====', data, voyage)
  const nbTravelers = data.nbAdults + data.nbChildren
  const { startingPrice, flightPrice = 0, extensionPrice = 0, promoChildren = 0, nbChildren = 0, earlybirdAvailable = 'Non', promoEarlybird = 0, lastMinuteAvailable = 'Non', promoLastMinute = 0, promoValue = 0 } = voyage
  let price = (startingPrice) * nbTravelers
  console.log('price====', price, nbTravelers, startingPrice, flightPrice, extensionPrice, promoChildren, nbChildren, earlybirdAvailable, promoEarlybird, lastMinuteAvailable, promoLastMinute, promoValue)
  price += flightPrice * nbTravelers

  price += extensionPrice * nbTravelers

  if (promoChildren && nbChildren) {
    price -= promoChildren * nbChildren
  }

  if (earlybirdAvailable === 'Oui' && promoEarlybird) {
    price -= earlybirdAvailable * promoEarlybird * nbTravelers
  }

  if (lastMinuteAvailable === 'Oui' && promoLastMinute) {
    price -= lastMinuteAvailable * promoLastMinute * nbTravelers
  }

  if (promoValue) {
    price -= promoValue * nbTravelers
  }

  return Math.ceil(price / nbTravelers)
}
