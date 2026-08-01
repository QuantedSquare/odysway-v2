import { defineEventHandler, createError } from 'h3'

// Restauration d'une réservation seule.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug, bookedId } = event.context.params
  if (!dateId || !slug || !bookedId) {
    throw createError({ statusCode: 400, statusMessage: 'slug, dateId et bookedId requis' })
  }

  await booking.requireActiveTravelDate(dateId, slug, { includeDeleted: true })

  const bookedRow = await booking.retrieveBookedDateById(bookedId, { includeDeleted: true })
  if (!bookedRow) {
    throw createError({ statusCode: 404, statusMessage: 'Réservation introuvable' })
  }
  if (!bookedRow.deleted) {
    return { success: true, alreadyActive: true, booked: bookedRow }
  }

  // La réservation peut avoir été déplacée depuis : on restaure là où elle
  // pointe réellement, pas là où l'écran a été ouvert.
  const targetDateId = bookedRow.travel_date_id

  const { data: parent } = await supabase
    .from('travel_dates')
    .select('id, deleted')
    .eq('id', targetDateId)
    .maybeSingle()

  if (parent?.deleted) {
    throw createError({
      statusCode: 409,
      statusMessage: 'La date de cette réservation est supprimée — restaurez la date d\'abord',
      data: { code: 'RESTORE_PARENT_DELETED', travel_date_id: targetDateId },
    })
  }

  const restored = await booking.restoreBookedDateById(bookedId)
  if (restored.error) {
    throw createError({ statusCode: 500, statusMessage: restored.error })
  }

  const recompute = await booking.recomputeBookedSeatAndStatus(targetDateId)
  if (recompute?.error) {
    throw createError({ statusCode: 500, statusMessage: recompute.error })
  }

  await logDateActivity(targetDateId, bookingUser, 'deal_restored', {
    deal_id: bookedRow.deal_id,
    booked_id: bookedId,
    cause: 'manual_restore',
    previous_reason: bookedRow.deleted_reason || null,
  })

  // On ne touche pas au deal de départ : s'il a été supprimé dans AC il n'est
  // pas récupérable, et le recréer automatiquement spammerait le pipeline 4.
  return {
    success: true,
    booked: restored.rows[0] || null,
    recomputed: { travel_date_id: targetDateId, booked_seat: recompute.booked_seat, status: recompute.status },
  }
})
