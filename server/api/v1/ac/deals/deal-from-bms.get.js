import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const { bookedId } = getQuery(event)

  const { data, error } = await supabase
    .from('booked_dates')
    .select('deal_id')
    .eq('id', bookedId)
    .single()
  if (error) {
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'DEAL_FROM_BMS_NOT_FOUND',
      step: 'init',
      origin: { field: 'bookedId', received: bookedId, endpoint: 'booked_dates' },
      message: 'Impossible de récupérer le deal depuis booked_dates',
    })
  }
  try {
    await activecampaign.recalculatTotalValues(data.deal_id)

    const [fetchedDeal, customFields] = await Promise.all([
      activecampaign.getDealById(data.deal_id),
      activecampaign.getDealCustomFields(data.deal_id),
    ])

    const fullContact = await activecampaign.getClientById(fetchedDeal.deal.contact)
    const contact = fullContact.contact

    if (!fetchedDeal.deal || !customFields) {
      throw funnelReporter.funnelCreateError({
        statusCode: 404,
        code: 'DEAL_FROM_BMS_EMPTY',
        step: 'init',
        origin: { field: 'deal', received: data.deal_id },
        message: 'Deal AC introuvable ou champs personnalisés manquants',
      })
    }
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
    // Re-throw an already-instrumented funnel error untouched (keeps its code).
    if (err?.data?.code) throw err
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'DEAL_FROM_BMS_FETCH_FAILED',
      step: 'init',
      origin: { field: 'deal', received: data.deal_id },
      message: 'Erreur lors de la récupération du deal depuis ActiveCampaign',
    })
  }
})
