import { defineEventHandler, createError } from 'h3'

// Suppression d'une date de départ : soft delete en cascade.
//
// Rien n'est effacé physiquement, ni les lignes ni les objets Storage. La
// restauration (restore.post.js) remonte exactement les enfants portant
// deleted_reason = 'cascade_travel_date'.

const CHILD_TABLES = ['booked_dates', 'date_notes', 'date_attachments', 'date_invoices']

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }

  // 404 si la date n'existe pas, n'appartient pas à ce slug, ou est déjà supprimée.
  const travelDate = await booking.requireActiveTravelDate(dateId, slug)
  const batch = softDelete.newBatch()

  // 1. Deal de départ (pipeline 4).
  //    cleanupDepartureDealIfEmpty ne suffit pas ici : il ne tire que s'il ne
  //    reste aucune réservation payante, or la date disparaît quoi qu'il arrive.
  //    Et surtout, travel_dates porte UNIQUE(departure_id) : un tombstone qui
  //    garderait son departure_id squatterait ce deal AC à vie et ferait échouer
  //    toute assignation future sur un 23505 opaque.
  const previousDepartureId = travelDate.departure_id || null
  if (previousDepartureId) {
    try {
      await activecampaign.deleteDeal(previousDepartureId)
    }
    catch (err) {
      console.error('[date.delete] suppression du deal de départ AC échouée:', err.message)
    }
    const { error: clearError } = await supabase
      .from('travel_dates')
      .update({ departure_id: null })
      .eq('id', dateId)
    if (clearError) {
      console.error('[date.delete] departure_id non remis à null:', clearError)
    }
  }

  // 2. Les enfants D'ABORD, le parent ENSUITE.
  //    La cascade n'est pas transactionnelle (appels PostgREST successifs). Cet
  //    ordre fait qu'une exécution partielle ressemble à « enfants trop
  //    supprimés » — que le prochain recomputeBookedSeatAndStatus corrige — et
  //    non à « enfants vivants sous une date morte ».
  //    softDelete.remove() filtre sur deleted = false : les lignes déjà
  //    supprimées à la main gardent leur raison 'manual' et ne remonteront donc
  //    pas lors d'une restauration. C'est voulu.
  const softDeleted = {}
  for (const table of CHILD_TABLES) {
    const res = await softDelete.remove(table, q => q.eq('travel_date_id', dateId), {
      user: bookingUser,
      reason: softDelete.REASONS.CASCADE_TRAVEL_DATE,
      batch,
      select: table === 'booked_dates' ? 'id, deal_id, booked_places' : 'id',
    })
    if (res.error) {
      throw createError({ statusCode: 500, statusMessage: `${table}: ${res.error}` })
    }
    softDeleted[table] = res.count
    if (table === 'booked_dates') softDeleted.deal_ids = res.rows.map(r => r.deal_id)
  }

  // 3. Le parent. On ne remet PAS booked_seat à 0 : la restauration doit être
  //    exacte, et toutes les lectures filtrent déjà les dates supprimées.
  const removed = await softDelete.remove('travel_dates', q => q.eq('id', dateId), {
    user: bookingUser,
    reason: softDelete.REASONS.MANUAL,
    batch,
    select: 'id, deleted_at',
  })
  if (removed.error) {
    throw createError({ statusCode: 500, statusMessage: removed.error })
  }
  if (!removed.count) {
    // Course avec une autre suppression concurrente.
    throw createError({ statusCode: 409, statusMessage: 'Cette date vient d\'être supprimée par ailleurs' })
  }

  await logDateActivity(dateId, bookingUser, 'date_deleted', {
    batch,
    departure_id: previousDepartureId,
    counts: {
      booked_dates: softDeleted.booked_dates,
      date_notes: softDeleted.date_notes,
      date_attachments: softDeleted.date_attachments,
      date_invoices: softDeleted.date_invoices,
    },
    deal_ids: softDeleted.deal_ids,
  })

  return {
    success: true,
    batch,
    deletedAt: removed.rows[0]?.deleted_at || null,
    softDeleted: {
      booked_dates: softDeleted.booked_dates,
      date_notes: softDeleted.date_notes,
      date_attachments: softDeleted.date_attachments,
      date_invoices: softDeleted.date_invoices,
    },
  }
})
