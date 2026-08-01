import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)
  if (!token || token !== process.env.ACTIVECAMPAIGN_WEBHOOK_TOKEN) {
    return { error: 'Unauthorized' }
  }
  try {
    const body = await readBody(event)
    console.log('Deal delete webhook received', body)

    const dealId = body['deal[id]']
    if (!dealId) {
      throw createError({ statusCode: 400, message: 'Missing deal id' })
    }

    const acUser = { email: 'activecampaign' }

    // Soft delete de la réservation + resync du compteur de places.
    // retrieveBookedDateByDealId respecte désormais le contrat `null | row` :
    // le garde ci-dessous garde réellement (il passait systématiquement, car
    // `.single()` renvoyait un objet d'erreur truthy sur zéro ligne).
    const bookedRow = await booking.retrieveBookedDateByDealId(dealId)
    if (bookedRow) {
      const travel_date_id = bookedRow.travel_date_id
      try {
        await booking.softDeleteBookedDateByDealId(dealId, {
          user: acUser,
          reason: softDelete.REASONS.AC_DEAL_DELETED,
        })
        await booking.recomputeBookedSeatAndStatus(travel_date_id)
        await departures.cleanupDepartureDealIfEmpty(travel_date_id)
        await logDateActivity(travel_date_id, acUser, 'deal_removed', {
          deal_id: dealId, booked_id: bookedRow.id, source: 'ac_deal_deleted',
        })
      }
      catch (err) {
        console.error('Error soft-deleting booking rows for deleted deal:', err)
      }
    }

    // Soft delete de la ligne miroir : le hard delete trouait l'historique des
    // dashboards de reporting.
    const removed = await softDelete.remove('activecampaign_deals', q => q.eq('id', dealId), {
      user: acUser,
      reason: softDelete.REASONS.AC_DEAL_DELETED,
    })

    if (removed.error) {
      throw createError({ statusCode: 500, message: 'Failed to soft delete deal' })
    }

    return { success: true, deletedDealId: dealId }
  }
  catch (err) {
    console.error('DealDelete webhook error:', err)
    throw createError({ statusCode: 500, message: 'Unexpected error in deal delete process' })
  }
})
