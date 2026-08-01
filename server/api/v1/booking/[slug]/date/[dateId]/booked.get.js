import { defineEventHandler, createError, getQuery } from 'h3'

// ⚠️ Cet endpoint SUPPRIMAIT en dur les réservations dont le deal AC ne
// renvoyait pas d'email — y compris quand ActiveCampaign était simplement
// injoignable, puisque le catch fabriquait `{ name: '', email: '' }`. Charger la
// page BMS d'une date pendant une panne AC détruisait donc des réservations et
// réécrivait booked_seat. Un GET ne mute plus rien : les lignes sans email sont
// renvoyées avec `orphan: true` et l'opérateur décide.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }
  // Ensure the date exists and matches slug (avoid returning wrong travelers list)
  await booking.requireActiveTravelDate(dateId, slug, { includeDeleted: true })

  // ?includeDeleted=true : section « Voyageurs supprimés » du BMS.
  const { includeDeleted } = getQuery(event)
  const withDeleted = includeDeleted === 'true' || includeDeleted === '1'

  let query = supabase
    .from('booked_dates')
    .select('*')
    .eq('travel_date_id', dateId)
  if (!withDeleted) query = query.eq('deleted', false)

  const { data, error } = await query

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // Enrich each traveler with contact info from ActiveCampaign
  const travelers = await Promise.all((data || []).map(async (row) => {
    let contact = {}
    let customFields = {}
    let acLookupFailed = false
    try {
      const deal = await activecampaign.getDealById(row.deal_id)
      customFields = await activecampaign.getDealCustomFields(row.deal_id)
      customFields.price = deal.deal.value
      if (deal && deal.deal && deal.deal.contact) {
        const contactId = deal.deal.contact
        let contactData = null
        contactData = await activecampaign.getClientById(contactId)
        if (contactData && contactData.contact) {
          contact = {
            name: (contactData.contact.firstName || '') + ' ' + (contactData.contact.lastName || ''),
            email: contactData.contact.email || '',
          }
        }
        else {
          contact = {
            name: deal.deal.contact.fullName || '',
            email: deal.deal.contact.email || '',
          }
        }
      }
    }
    catch (err) {
      // On distingue « AC injoignable » de « deal réellement sans email » :
      // c'est précisément cette confusion qui faisait perdre des réservations.
      acLookupFailed = true
      contact = { name: '', email: '' }
      console.error(`[booked.get] lookup AC échoué dealId=${row.deal_id}:`, err.message)
    }
    return {
      ...row,
      ...contact,
      // Orpheline = le deal existe côté AC mais n'a pas d'email. Si le lookup a
      // échoué, on ne sait rien : ce n'est pas une orpheline.
      orphan: !acLookupFailed && !contact.email?.trim(),
      acLookupFailed,
      nbTravelers: customFields.nbTravelers,
      alreadyPaid: customFields.alreadyPaid,
      restToPay: customFields.restToPay,
      price: +customFields.price,
    }
  }))

  return travelers
})
