import dayjs from 'dayjs'
// utils/voyageBuilders.js
export function buildVoyageFromSanity(fetchedDate, travel, imgSrc = null) {
  return {
    departureDate: fetchedDate.departure_date,
    returnDate: fetchedDate.return_date,
    title: travel.title,
    imgSrc: travel.image?.asset?.url || imgSrc || '/images/sur-mesure/AdobeStock_557006728.webp',
    country: travel.destinations.map(d => d.iso).join(','),
    slug: travel.slug,
    iso: travel.destinations.map(d => d.iso).join(','),
    zoneChapka: +travel.destinations[0]?.chapka || 0,
    privatisation: travel.privatisationAvailable || true,
    startingPrice: fetchedDate.starting_price * 100,
    indivRoomPrice: travel.pricing?.indivRoom && travel.pricing?.indivRoomPrice > 0 ? travel.pricing.indivRoomPrice * 100 : 0,
    gotIndivRoomAvailable: travel.pricing?.indivRoom && travel.pricing?.indivRoomPrice > 0,
    gotEarlybird: fetchedDate.early_bird && dayjs(fetchedDate.departure_date).isAfter(dayjs().add(7, 'month')),
    promoEarlybird: travel.pricing?.earlyBirdReduction * 100 || 0,
    gotLastMinute: fetchedDate.last_minute && dayjs(fetchedDate.departure_date).isBefore(dayjs().add(1, 'month')),
    promoLastMinute: travel.pricing?.lastMinuteReduction * 100 || 0,
    depositPrice: +fetchedDate.starting_price * 0.3,
    promoChildren: travel.pricing?.childrenPromo * 100 || 0,
    maxChildrenAge: travel.pricing?.childrenAge || 12,
    source: 'Devis',
    forcedIndivRoom: travel.pricing?.forcedIndivRoom || false,
    travelType: 'Groupe', // TODO: check comment le rendre dynamique
    flightPrice: fetchedDate.flight_price * 100 || 0,
    includeFlight: fetchedDate.include_flight,
    extensionPrice: 0,
    promoValue: 0,
    alreadyPaid: 0,
    totalTravelPrice: +fetchedDate.starting_price * 100,
  }
}

export function buildVoyageFromAC(deal, imgSrc = null) {
  return {
    departureDate: deal.departureDate,
    returnDate: deal.returnDate,
    title: deal.title,
    imgSrc: deal.image?.startsWith('http') ? deal.image : imgSrc || '/images/sur-mesure/AdobeStock_557006728.webp',
    country: deal.country,
    slug: deal.slug,
    iso: deal.iso,
    startingPrice: deal.basePricePerTraveler,
    zoneChapka: +deal.zoneChapka,
    depositPrice: +deal.depositPrice, // #Todo faire sauter
    promoChildren: deal.promoChildren,
    maxChildrenAge: deal.maxChildrenAge || 12,
    source: 'Devis', // Possible que ça change
    forcedIndivRoom: deal.forcedIndivRoom === 'Oui',
    indivRoomPrice: deal.indivRoomPrice,
    gotIndivRoomAvailable: deal.indivRoomPrice > 0,
    promoEarlybird: deal.promoEarlybird || 0,
    promoLastMinute: deal.promoLastMinute || 0,
    gotLastMinute: deal.gotLastMinute === 'Oui',
    gotEarlybird: deal.gotEarlybid === 'Oui',
    travelType: deal.travelType,
    extensionPrice: deal.extensionPrice || 0,
    includeFlight: deal.includeFlight === 'Oui',
    flightPrice: deal.flightPrice || 0,
    promoValue: deal.promoValue || 0,
    alreadyPaid: deal.alreadyPaid || 0,
    totalTravelPrice: deal.value,
  }
}

export function buildDynamicDealValues(deal = null) {
  if (!deal) return {
    nbTravelers: 1,
    nbAdults: 1,
    nbChildren: 0,
    nbUnderAge: 0,
    nbTeen: 0,
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    optinNewsletter: false,

    // Travelers Infos
    isCouple: false,
    // Options
    specialRequest: '',
    indivRoom: false,
    // Insurances
    insurance: false,
    insuranceCommissionPrice: 0,
    insuranceCommissionPerTraveler: 0,
  }
  else {
    const travelersData = {}
    const numberOfTravelers = +deal.nbTravelers || 1

    // Add travelers data for up to 11 travelers
    for (let i = 1; i <= 11; i++) {
      const travelerKey = `traveler${i}`
      if (deal[travelerKey]) {
      // Use existing traveler data from ActiveCampaign
        travelersData[travelerKey] = deal[travelerKey]
      }
      else if (i <= numberOfTravelers) {
      // Initialize empty traveler data for the expected number of travelers
        travelersData[travelerKey] = null
      }
    }
    const dynamicValues = {
    // Details
      nbTravelers: +deal.nbTravelers,
      nbAdults: +deal.nbAdults || 1,
      nbChildren: +deal.nbChildren || 0,
      nbUnderAge: +deal.nbUnderAge || 0,
      email: deal.contact.email,
      phone: deal.contact.phone,
      firstName: deal.contact.firstName,
      lastName: deal.contact.lastName,
      optinNewsletter: false,
      // Travelers Infos
      isCouple: deal.isCouple === 'Oui',
      ...travelersData,
      // Options
      specialRequest: deal.specialRequest,
      indivRoom: deal.indivRoom === 'Oui',
      // Insurances
      insurance: deal.insurance,
      insuranceCommissionPrice: deal.insuranceCommissionPrice || 0,
      insuranceCommissionPerTraveler: deal.insuranceCommissionPerTraveler || 0,
      alreadyPaid: deal.alreadyPaid,
    }
    return dynamicValues
  }
}
