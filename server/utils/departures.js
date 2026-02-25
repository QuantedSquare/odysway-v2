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
 * Fetches all paid booked_dates for a travel date and aggregates their
 * AC deal values and traveler counts into a single enrichment object.
 */
const computeDepartureEnrichment = async (travelDateId, travelDate) => {
  const config = useRuntimeConfig()
  const origin = config.public.siteURL

  const bmsLink = `${origin}/booking-management/${travelDate.travel_slug}/${travelDateId}`

  const { data: paidBookings } = await supabase
    .from('booked_dates')
    .select('deal_id, booked_places')
    .eq('travel_date_id', travelDateId)
    .gt('booked_places', 0)

  let totalValue = 0
  let totalNbTravelers = 0

  if (paidBookings && paidBookings.length > 0) {
    const dealData = await Promise.all(
      paidBookings.map(async (b) => {
        try {
          const { deal } = await activecampaign.getDealById(b.deal_id)
          return {
            value: Number(deal?.value || 0),
            nbTravelers: Number(b.booked_places || 0),
          }
        }
        catch {
          return { value: 0, nbTravelers: Number(b.booked_places || 0) }
        }
      }),
    )
    totalValue = dealData.reduce((acc, d) => acc + d.value, 0)
    totalNbTravelers = dealData.reduce((acc, d) => acc + d.nbTravelers, 0)
  }

  return { totalValue, totalNbTravelers, bmsLink }
}

/**
 * Returns the existing departure deal ID for a travel date, or creates a new one
 * in pipeline 4 ("Gestions Départs") and stores its ID in travel_dates.departure_id.
 */
const getOrCreateDepartureDeal = async (travelDateId, travelDate, travelTitle, enrichment = {}) => {
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
    ...enrichment,
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
      .select('id, travel_slug, departure_date, return_date, booked_seat, min_travelers, departure_id')
      .eq('id', bookedDate.travel_date_id)
      .single()

    if (fetchError || !travelDate) {
      console.error('handlePaymentForDeparture: could not fetch travel_date', fetchError)
      return
    }

    // Aggregate values from all paying clients on this date
    const enrichment = await computeDepartureEnrichment(travelDate.id, travelDate)

    const departureDealId = await getOrCreateDepartureDeal(
      travelDate.id,
      travelDate,
      travelTitle,
      enrichment,
    )

    await assignContactToDepartureDeal(departureDealId, contactId)

    // Always sync stage + aggregated values so the departure deal stays up to date
    // as new clients pay (totals grow over time)
    const stageId = computeDepartureStage(
      travelDate.departure_date,
      travelDate.return_date,
      travelDate.booked_seat,
      travelDate.min_travelers,
    )

    await activecampaign.updateDeal(departureDealId, {
      stage: String(stageId),
      value: enrichment.totalValue,
      nbTravelers: enrichment.totalNbTravelers,
      linkBms: enrichment.bmsLink,
    })
  }
  catch (err) {
    console.error('handlePaymentForDeparture error:', err)
  }
}

/**
 * After a booked_date is deleted, checks whether any paying clients remain
 * on the same travel date. If none do and a departure record deal exists,
 * deletes it from ActiveCampaign and clears travel_dates.departure_id.
 *
 * Must be called AFTER the booked_date row has already been removed.
 */
const cleanupDepartureDealIfEmpty = async (travelDateId) => {
  try {
    const { data: travelDate, error: fetchError } = await supabase
      .from('travel_dates')
      .select('id, departure_id')
      .eq('id', travelDateId)
      .single()

    if (fetchError || !travelDate || !travelDate.departure_id) return

    const { data: remainingPaid } = await supabase
      .from('booked_dates')
      .select('id')
      .eq('travel_date_id', travelDateId)
      .gt('booked_places', 0)
      .limit(1)

    if (remainingPaid && remainingPaid.length > 0) return

    // No paying clients left — remove the departure record deal
    console.log(`cleanupDepartureDealIfEmpty: no paid bookings left for travel_date ${travelDateId}, deleting departure deal ${travelDate.departure_id}`)

    try {
      await activecampaign.deleteDeal(travelDate.departure_id)
    }
    catch (err) {
      console.error('cleanupDepartureDealIfEmpty: failed to delete AC departure deal:', err.message)
    }

    const { error: clearError } = await supabase
      .from('travel_dates')
      .update({ departure_id: null })
      .eq('id', travelDateId)

    if (clearError) {
      console.error('cleanupDepartureDealIfEmpty: failed to clear departure_id:', clearError)
    }
  }
  catch (err) {
    console.error('cleanupDepartureDealIfEmpty error:', err)
  }
}

export default {
  computeDepartureStage,
  getOrCreateDepartureDeal,
  assignContactToDepartureDeal,
  handlePaymentForDeparture,
  cleanupDepartureDealIfEmpty,
  STAGES,
}
