import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const { bookedId } = getQuery(event)

  const { data, error } = await supabase
    .from('booked_dates')
    .select('deal_id')
    .eq('id', bookedId)
    .single()
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting deal from booked_dates',
    })
  }
  try {
    await activecampaign.recalculatTotalValues(data.deal_id)

    const [fetchedDeal, customFields] = await Promise.all([
      activecampaign.getDealById(data.deal_id),
      activecampaign.getDealCustomFields(data.deal_id),
    ])
    // const reponse = await activecampaign.getDealById(dealId)
    // const customFields = await activecampaign.getDealCustomFields(dealId)
    const fullContact = await activecampaign.getClientById(fetchedDeal.deal.contact)
    const contact = fullContact.contact

    if (!fetchedDeal.deal || !customFields) {
      throw createError({
        statusCode: 404,
        message: 'Deal not found',
      })
    }
    console.log('contact in deal-from-bms', contact.fieldValues)
    return {
      ...fetchedDeal.deal,
      ...customFields,
      contact: {
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        isoContact: fullContact.fieldValues.find(i => i.field === '22')?.value || '',
      },
    }
  }
  catch (err) {
    console.log('Error getting deal from booked_dates', err)
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting deal from booked_dates',
    })
  }
})
