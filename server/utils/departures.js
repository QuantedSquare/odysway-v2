import dayjs from 'dayjs'
import { createClient } from '@sanity/client'
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
  const isConfirmed = Number(bookedSeat || 0) >= Number(minTravelers || 1)

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
    .eq('deleted', false)
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
const getOrCreateDepartureDeal = async (travelDateId, travelDate, travelTitle, enrichment = {}, contactId) => {
  if (travelDate.departure_id) {
    return travelDate.departure_id
  }

  const stageId = computeDepartureStage(
    travelDate.departure_date,
    travelDate.return_date,
    travelDate.booked_seat,
    travelDate.min_travelers,
  )

  // Create without bmsLink first (we need the deal ID to build it)
  const departureDealId = await activecampaign.createDepartureDeal({
    travelDate,
    travelTitle,
    stageId,
    contactId,
    ...enrichment,
    linkBms: '',
  })

  const { error } = await supabase
    .from('travel_dates')
    .update({ departure_id: departureDealId })
    .eq('id', travelDateId)

  if (error) {
    console.error('Error saving departure_id to travel_dates:', error)
  }

  // Now update with the bmsLink that includes the travel_date ID
  if (enrichment.bmsLink) {
    await activecampaign.updateDeal(departureDealId, { linkBms: enrichment.bmsLink })
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
const travelTypePrefixMap = {
  groupe: 'GIR',
  privatisation: 'PRIVAT',
  custom: 'SUR-MESURE',
}

const handlePaymentForDeparture = async (bookedDate, travelTitle, contactId) => {
  try {
    const { data: travelDate, error: fetchError } = await supabase
      .from('travel_dates')
      .select('id, travel_slug, departure_date, return_date, booked_seat, min_travelers, departure_id, bms_reference, travel_type_prefix')
      .eq('id', bookedDate.travel_date_id)
      .single()

    if (fetchError || !travelDate) {
      console.error('handlePaymentForDeparture: could not fetch travel_date', fetchError)
      return
    }

    let bmsReference = travelDate.bms_reference
    let travelTypePrefix = travelDate.travel_type_prefix

    // Only fetch from Sanity if not yet cached in travel_dates
    if (!bmsReference || !travelTypePrefix) {
      const config = useRuntimeConfig()
      const sanityClient = createClient({
        projectId: config.public.sanity.projectId,
        dataset: config.public.sanity.dataset,
        apiVersion: '2025-01-01',
        token: process.env.SANITY_WRITE_TOKEN,
        useCdn: false,
      })

      const voyageFromSanity = await sanityClient.fetch(
        `*[_type == "voyage" && slug.current == $slug][0]{ bmsReference, availabilityTypes }`,
        { slug: travelDate.travel_slug },
      )

      bmsReference = voyageFromSanity?.bmsReference || travelTitle
      const availabilityType = voyageFromSanity?.availabilityTypes?.[0]
      travelTypePrefix = availabilityType ? (travelTypePrefixMap[availabilityType] ?? null) : null

      // Cache for future payments on this date
      await supabase
        .from('travel_dates')
        .update({ bms_reference: bmsReference, travel_type_prefix: travelTypePrefix })
        .eq('id', travelDate.id)
    }

    const departureTravelTitle = travelTypePrefix ? `${travelTypePrefix} | ${bmsReference}` : bmsReference

    // Aggregate values from all paying clients on this date
    const enrichment = await computeDepartureEnrichment(travelDate.id, travelDate)

    const departureDealId = await getOrCreateDepartureDeal(
      travelDate.id,
      travelDate,
      departureTravelTitle,
      enrichment,
      contactId,
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
 * Après la suppression d'une réservation, vérifie s'il reste des clients payants
 * sur la même date. S'il n'en reste aucun, le deal de départ (pipeline 4) est
 * MIS EN VEILLE — il n'est jamais supprimé.
 *
 * Cette fonction appelait activecampaign.deleteDeal() et remettait
 * travel_dates.departure_id à null. Une désaffectation suivie d'une
 * ré-affectation — rare, mais c'est le quotidien des dossiers sur-mesure à un
 * seul payant, où retirer le pax vide la date — détruisait donc le deal AC avec
 * ses notes, tâches, rappels et propriétaire, puis en recréait un vierge. L'OPS
 * repartait de zéro sur le suivi.
 *
 * On garde désormais le deal et son departure_id : à la ré-affectation,
 * getOrCreateDepartureDeal retombe sur le même deal et handlePaymentForDeparture
 * le rallume au bon stage avec les bons totaux. Aucun doublon, aucun ménage.
 *
 * Contrepartie assumée : une date qui ne se remplit jamais garde un deal à 0 pax
 * en « Départ à confirmer ». La note horodatée le rend identifiable pour un
 * nettoyage manuel dans AC.
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

    // ⚠️ Le .eq('deleted', false) est indispensable : cette sonde supposait que la
    // ligne était PHYSIQUEMENT absente. Une réservation soft-deleted garde
    // booked_places > 0 (la restauration doit être exacte), donc sans ce filtre la
    // sonde conclut « il reste des clients payants » et le deal de départ
    // pipeline 4 n'est jamais mis en veille.
    const { data: remainingPaid } = await supabase
      .from('booked_dates')
      .select('id')
      .eq('travel_date_id', travelDateId)
      .eq('deleted', false)
      .gt('booked_places', 0)
      .limit(1)

    if (remainingPaid && remainingPaid.length > 0) return

    const idleStage = String(STAGES.DEPART_A_CONFIRMER)

    // État courant du deal : sert à la fois de sonde d'existence et de garde
    // d'idempotence. Les webhooks AC (dealDelete, dealUpdate) peuvent tirer
    // plusieurs fois sur la même date ; sans ce garde on empilerait une note à
    // chaque passage.
    let currentStage = null
    let currentValue = 0
    try {
      const { deal } = await activecampaign.getDealById(travelDate.departure_id)
      currentStage = deal?.stage ? String(deal.stage) : null
      currentValue = Number(deal?.value || 0)
    }
    catch (err) {
      if (err.response?.status === 404) {
        // Deal supprimé à la main dans AC : il n'y a plus d'historique à
        // protéger, et garder le pointeur ferait échouer toutes les mises à
        // jour futures. On libère le lien pour qu'un prochain paiement recrée
        // un deal propre.
        console.warn(`cleanupDepartureDealIfEmpty: deal de départ ${travelDate.departure_id} absent d'AC, departure_id libéré`)
        const { error: clearError } = await supabase
          .from('travel_dates')
          .update({ departure_id: null })
          .eq('id', travelDateId)
        if (clearError) {
          console.error('cleanupDepartureDealIfEmpty: departure_id non remis à null:', clearError)
        }
        return
      }
      console.error('cleanupDepartureDealIfEmpty: lecture du deal de départ échouée:', err.message)
      return
    }

    if (currentStage === idleStage && currentValue === 0) return

    console.log(`cleanupDepartureDealIfEmpty: plus aucune réservation payante sur la date ${travelDateId}, mise en veille du deal de départ ${travelDate.departure_id}`)

    try {
      await activecampaign.updateDeal(travelDate.departure_id, {
        stage: idleStage,
        value: 0,
        nbTravelers: 0,
      })
      await activecampaign.addNote(travelDate.departure_id, {
        note: {
          note: `[BMS] ${dayjs().format('DD/MM/YYYY HH:mm')} — plus aucun voyageur payant sur cette date. Deal conservé (suivi, notes et tâches intacts) : il sera réutilisé si un voyageur est réaffecté.`,
        },
      })
    }
    catch (err) {
      console.error('cleanupDepartureDealIfEmpty: mise en veille du deal de départ échouée:', err.message)
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
