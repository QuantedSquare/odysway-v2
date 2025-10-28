import dayjs from 'dayjs'

const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(customParseFormat)

export default {
  insurancePricePerPerson(insurancePricingPerTraveler, insurances) {
    return (insurancePricingPerTraveler.cancel * insurances.cancellation)
      + (insurancePricingPerTraveler.rapatriement * insurances.global)
  },
  pricePerTraveler(deal) {
    return deal // A FAIRE
  },
  baseChildrenAndTeenPrice(basePrice, reduction, nbChildren) {
    return basePrice - (reduction * (nbChildren > 0))
  },
  isUnderXYearsOld(maxAge, birthdate, departureDate) {
    const date = dayjs(birthdate, 'DD/MM/YYYY').format()
    const startDate = dayjs(departureDate, 'MM/DD/YYYY') // date format in dealData 'MM/DD/YYYY'
    const age = startDate.diff(date, 'year')

    return age < maxAge && age > 0
  },
  isOverXYearsOld(minAge, birthdate, departureDate) {
    const date = dayjs(birthdate, 'DD/MM/YYYY').format()
    const startDate = dayjs(departureDate, 'MM/DD/YYYY') // date format in dealData 'MM/DD/YYYY'
    const age = startDate.diff(date, 'year')

    return age >= minAge
  },
  childrenCount(travelers, maxAge, departureDate) {
    return travelers.filter((traveler) => {
      return this.isUnderXYearsOld(maxAge || 18, traveler.birthdate, departureDate) && traveler.birthdate !== 'Invalid Date'
    }).length
  },
  adultCountCheck(travelers, minAge, departureDate) {
    return travelers.filter((traveler) => {
      return this.isOverXYearsOld(minAge || 18, traveler.birthdate, departureDate) && traveler.birthdate !== 'Invalid Date'
    }).length
  },
}
