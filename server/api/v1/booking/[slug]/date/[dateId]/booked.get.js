import { defineEventHandler } from 'h3'


export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  const { data, error } = await supabase
    .from('booked_dates')
    .select('*')
    .eq('travel_date_id', dateId)

  if (error) return []

  // Enrich each traveler with contact info from ActiveCampaign
  const travelers = await Promise.all((data || []).map(async (row) => {
    let contact = {}
    let customFields = {}
    try {
      const deal = await activecampaign.getDealById(row.deal_id)
      customFields = await activecampaign.getDealCustomFields(row.deal_id)
      customFields.price = deal.deal.value
      console.log('=======customFields=======', customFields)
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
    catch {
      contact = { name: '', email: '' }
    }
    return {
      ...row,
      ...contact,
      nbTravelers: customFields.nbTravelers,
      alreadyPaid: customFields.alreadyPaid,
      restToPay: customFields.restToPay,
      price: +customFields.price,
    }
  }))

  // Filter out travelers without email and delete their booked_dates entries
  const validTravelers = []
  const travelersToDelete = []

  for (const traveler of travelers) {
    if (traveler.email && traveler.email.trim() !== '') {
      validTravelers.push(traveler)
    }
    else {
      travelersToDelete.push(traveler.id)
    }
  }

  // Delete booked_dates entries for travelers without email
  if (travelersToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('booked_dates')
      .delete()
      .in('id', travelersToDelete)

    if (deleteError) {
      console.error('Error deleting booked_dates entries:', deleteError)
    }
    else {
      console.log(`Deleted ${travelersToDelete.length} booked_dates entries without valid email`)
    }
  }

  return validTravelers
})
