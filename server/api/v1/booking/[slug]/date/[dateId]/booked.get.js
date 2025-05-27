import { defineEventHandler } from 'h3'
import supabase from '~/server/utils/supabase'
import activecampaign from '~/server/utils/activecampaign'

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

  return travelers
})
