import { defineEventHandler } from 'h3'

// Point d'entrée du checkout : rend un deal payable à partir de l'URL reçue par
// le client. Trois formes d'URL arrivent ici, par ordre de robustesse :
//
//   ?token=<token>      format actuel. Signé (server/utils/paymentLink.js), donc
//                       lié au DEAL et pas à une ligne de base : il ne peut plus
//                       mourir. Si la ligne booked_dates manque, on la recrée.
//   ?bookedId=<uuid>    format historique. Tant que la ligne existe, rien ne
//                       change. Si elle a été supprimée, on retrouve le deal via
//                       le journal d'activité BMS et on répare.
//   (rien de valide)    erreur funnel explicite.
//
// La réponse porte toujours `bookedId` : la page /checkout réécrit l'URL avec,
// pour que tout l'aval du funnel (Stripe, Alma, options, tracking) continue de
// travailler sur un booked_id comme avant.

export default defineEventHandler(async (event) => {
  const { bookedId, token } = getQuery(event)

  let dealId = null
  let resolvedBookedId = bookedId || null
  let repaired = false

  if (token) {
    dealId = paymentLink.verify(token)
    if (!dealId) {
      throw funnelReporter.funnelCreateError({
        statusCode: 400,
        code: 'DEAL_TOKEN_INVALID',
        step: 'init',
        origin: { field: 'token', received: token, endpoint: 'paymentLink.verify' },
        message: 'Lien de paiement invalide ou altéré',
      })
    }
    const { data } = await supabase
      .from('booked_dates')
      .select('id')
      .eq('deal_id', dealId)
      .maybeSingle()
    resolvedBookedId = data?.id || null
  }
  else if (bookedId) {
    const { data } = await supabase
      .from('booked_dates')
      .select('id, deal_id')
      .eq('id', bookedId)
      .maybeSingle()

    if (data) {
      dealId = data.deal_id
    }
    else {
      // Lien mort : le deal existe peut-être encore côté CRM.
      const recovered = await brokenLinks.findDealByDeadBookedId(bookedId)
      if (!recovered) {
        throw funnelReporter.funnelCreateError({
          statusCode: 404,
          code: 'DEAL_FROM_BMS_NOT_FOUND',
          step: 'init',
          origin: { field: 'bookedId', received: bookedId, endpoint: 'booked_dates' },
          message: 'Impossible de récupérer le deal depuis booked_dates',
        })
      }
      console.log(`[deal-from-bms] booked_id mort ${bookedId} rattaché au deal ${recovered.dealId} (supprimé par ${recovered.deletedBy} le ${recovered.deletedAt})`)
      dealId = recovered.dealId
      resolvedBookedId = null
    }
  }
  else {
    throw funnelReporter.funnelCreateError({
      statusCode: 400,
      code: 'DEAL_FROM_BMS_NO_PARAM',
      step: 'init',
      origin: { field: 'token|bookedId', received: null, expected: 'token de paiement ou booked_id' },
      message: 'Lien de paiement incomplet',
    })
  }

  try {
    await activecampaign.recalculatTotalValues(dealId)

    const [fetchedDeal, customFields] = await Promise.all([
      activecampaign.getDealById(dealId),
      activecampaign.getDealCustomFields(dealId),
    ])

    if (!fetchedDeal?.deal || !customFields) {
      throw funnelReporter.funnelCreateError({
        statusCode: 404,
        code: 'DEAL_FROM_BMS_EMPTY',
        step: 'init',
        origin: { field: 'deal', received: dealId },
        message: 'Deal AC introuvable ou champs personnalisés manquants',
      })
    }

    const deal = { ...fetchedDeal.deal, ...customFields }

    // La ligne booked_dates manque : on la recrée avant de laisser le client
    // avancer, sinon Stripe/Alma n'auraient rien à rattacher au paiement.
    if (!resolvedBookedId) {
      const resolution = await brokenLinks.resolveTravelDate(dealId, deal)
      if (!resolution.autoRepairable || !resolution.travelDateId) {
        throw funnelReporter.funnelCreateError({
          statusCode: 409,
          code: 'DEAL_LINK_UNREPAIRABLE',
          step: 'init',
          origin: { field: 'travel_date', received: resolution.source, endpoint: 'brokenLinks.resolveTravelDate' },
          message: `Réservation introuvable pour le deal ${dealId} (résolution : ${resolution.source})`,
        })
      }
      const { bookedDate } = await brokenLinks.repairDealLink({
        dealId,
        travelDateId: resolution.travelDateId,
        deal,
        reason: 'checkout_auto',
      })
      resolvedBookedId = bookedDate.id
      repaired = true
    }

    const fullContact = await activecampaign.getClientById(deal.contact)
    const contact = fullContact.contact

    return {
      ...deal,
      bookedId: resolvedBookedId,
      repaired,
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
      origin: { field: 'deal', received: dealId },
      message: 'Erreur lors de la récupération du deal depuis ActiveCampaign',
    })
  }
})
