import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }
  // Fetch the original date
  const { data: original, error } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .eq('deleted', false)
    .single()
  if (error || !original) {
    throw createError({ statusCode: 404, statusMessage: 'Date introuvable' })
  }

  // Prepare new row (omit id, created_at, set booked_seat to 0)
  const rest = { ...original }
  delete rest.id
  delete rest.created_at
  delete rest.booked_seat
  // Reset automated counters/status for the new date
  delete rest.status
  // Never carry over the departure deal — it belongs to the original date only
  delete rest.departure_id
  // Ne jamais recopier la pierre tombale : `select('*')` ramène désormais les
  // colonnes de soft delete, et dupliquer une date supprimée produirait une
  // date invisible sans la moindre erreur.
  delete rest.deleted
  delete rest.deleted_at
  delete rest.deleted_by
  delete rest.deleted_reason
  delete rest.deleted_batch
  const newDate = { ...rest, booked_seat: 0, status: 'soon_confirmed', deleted: false }

  // Insert new row
  const { data: inserted, error: insertError } = await supabase
    .from('travel_dates')
    .insert([newDate])
    .select('*')
    .single()
  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message })
  }

  await logDateActivity(inserted.id, bookingUser, 'duplicated', { source_date_id: dateId })

  return inserted
})
