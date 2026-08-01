import { defineEventHandler, createError } from 'h3'

// Restauration d'une ligne miroir activecampaign_deals.
//
// Portée volontairement limitée au miroir de reporting : on ne ressuscite PAS
// la réservation liée au passage. Les deux vivent dans la corbeille comme deux
// entrées distinctes, parce que ce sont deux décisions différentes — remettre un
// deal dans les dashboards n'implique pas de réoccuper une place sur un départ.
// La réponse signale quand une réservation supprimée existe encore pour ce deal,
// pour que l'opérateur enchaîne s'il le souhaite.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dealId } = event.context.params
  if (!dealId) {
    throw createError({ statusCode: 400, statusMessage: 'dealId requis' })
  }

  const restored = await softDelete.restore('activecampaign_deals', q => q.eq('id', dealId), {
    select: 'id, title, status, pipeline_title, total_value',
  })
  if (restored.error) {
    throw createError({ statusCode: 500, statusMessage: restored.error })
  }
  if (!restored.count) {
    throw createError({ statusCode: 404, statusMessage: 'Aucun deal supprimé à restaurer pour cet identifiant' })
  }

  // Réservation encore en corbeille pour ce deal ? On informe sans agir.
  const booked = await booking.retrieveBookedDateByDealId(dealId, { includeDeleted: true })
  const bookedStillDeleted = booked?.deleted === true

  if (bookedStillDeleted && booked.travel_date_id) {
    await logDateActivity(booked.travel_date_id, bookingUser, 'deal_mirror_restored', {
      deal_id: Number(dealId),
      booked_id: booked.id,
      note: 'ligne miroir restaurée, réservation toujours supprimée',
    })
  }

  return {
    success: true,
    deal: restored.rows[0] || null,
    bookedStillDeleted,
    booked: bookedStillDeleted
      ? { id: booked.id, travel_date_id: booked.travel_date_id, deleted_reason: booked.deleted_reason }
      : null,
  }
})
