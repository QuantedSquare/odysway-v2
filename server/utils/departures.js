import dayjs from 'dayjs'
import supabase from './supabase'
import activecampaign from './activecampaign'

// Stage IDs for the "Gestions Départs" pipeline (ID 4)
const STAGES = {
  DEPART_A_CONFIRMER: 60, // booked_seat < min_travelers AND departure > +30 days
  DEPART_CONFIRME_J35: 61, // confirmed AND departure > +35 days
  DEPART_CONFIRME_J35_J30: 69, // confirmed AND departure between 30–35 days
  GESTION_J30_J15: 52, // confirmed AND departure between 15–30 days
  GESTION_J15_J3: 51, // confirmed AND departure between 3–15 days
  DEPARTS_IMMINENTS: 62, // departure within 3 days
  VOYAGE_EN_COURS: 56, // today between departure_date and return_date
  RETOUR_VOYAGE: 65, // today > return_date
}

/**
 * Determines the correct pipeline stage ID based on departure/return dates
 * and current booking count vs minimum required travelers.
 */
const computeDepartureStage = (departureDate, returnDate, bookedSeat, minTravelers) => {
  const today = dayjs()
  const departure = dayjs(departureDate)
  const returnDay = dayjs(returnDate)
  const daysUntilDeparture = departure.diff(today, 'day')
  const isConfirmed = Number(bookedSeat || 0) >= Number(minTravelers || 0)

  if (today.isAfter(returnDay)) return STAGES.RETOUR_VOYAGE
  if (today.isAfter(departure) || today.isSame(departure, 'day')) return STAGES.VOYAGE_EN_COURS
  if (daysUntilDeparture <= 3) return STAGES.DEPARTS_IMMINENTS

  if (!isConfirmed) return STAGES.DEPART_A_CONFIRMER

  if (daysUntilDeparture > 35) return STAGES.DEPART_CONFIRME_J35
  if (daysUntilDeparture > 30) return STAGES.DEPART_CONFIRME_J35_J30
  if (daysUntilDeparture > 15) return STAGES.GESTION_J30_J15
  return STAGES.GESTION_J15_J3
}

/**
 * Returns the existing departure deal ID for a travel date, or creates a new one
 * in pipeline 4 ("Gestions Départs") and stores its ID in travel_dates.departure_id.
 */
const getOrCreateDepartureDeal = async (travelDateId, travelDate, travelTitle) => {
  if (travelDate.departure_id) {
    return travelDate.departure_id
  }

  const stageId = computeDepartureStage(
    travelDate.departure_date,
    travelDate.return_date,
    travelDate.booked_seat,
    travelDate.min_travelers,
  )

  const departureDealId = await activecampaign.createDepartureDeal({
    travelDate,
    travelTitle,
    stageId,
  })

  const { error } = await supabase
    .from('travel_dates')
    .update({ departure_id: departureDealId })
    .eq('id', travelDateId)

  if (error) {
    console.error('Error saving departure_id to travel_dates:', error)
  }

  return departureDealId
}

/**
 * Associates a paying contact with the departure record deal.
 */
const assignContactToDepartureDeal = (departureDealId, contactId) => {
  return activecampaign.addContactToDeal(departureDealId, contactId)
}

/**
 * Main entry point called after a successful payment.
 * Ensures the departure record deal exists, assigns the contact, and sets the correct stage.
 *
 * @param {object} bookedDate - The booked_dates row returned from Supabase after update
 * @param {string} travelTitle - The title of the travel (from the client deal)
 * @param {string|number} contactId - The ActiveCampaign contact ID of the paying traveler
 */
const handlePaymentForDeparture = async (bookedDate, travelTitle, contactId) => {
  try {
    const { data: travelDate, error: fetchError } = await supabase
      .from('travel_dates')
      .select('id, departure_date, return_date, booked_seat, min_travelers, departure_id')
      .eq('id', bookedDate.travel_date_id)
      .single()

    if (fetchError || !travelDate) {
      console.error('handlePaymentForDeparture: could not fetch travel_date', fetchError)
      return
    }

    const departureDealId = await getOrCreateDepartureDeal(
      travelDate.id,
      travelDate,
      travelTitle,
    )

    await assignContactToDepartureDeal(departureDealId, contactId)

    // Sync the stage to reflect the current booking state
    const stageId = computeDepartureStage(
      travelDate.departure_date,
      travelDate.return_date,
      travelDate.booked_seat,
      travelDate.min_travelers,
    )

    await activecampaign.updateDeal(departureDealId, {
      stage: String(stageId),
    })
  }
  catch (err) {
    console.error('handlePaymentForDeparture error:', err)
  }
}

export default {
  computeDepartureStage,
  getOrCreateDepartureDeal,
  assignContactToDepartureDeal,
  handlePaymentForDeparture,
  STAGES,
}
