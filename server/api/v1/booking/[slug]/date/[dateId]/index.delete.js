import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }
  // Fetch the row to get travel_date_id
  const { data: dateRow, error: fetchError } = await supabase
    .from('travel_dates')
    .select('id')
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .single()

  if (fetchError || !dateRow) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Impossible de trouver la réservation à supprimer.',
    })
  }
  const travel_date_id = dateRow.id

  // Delete every booked_dates first for this date
  const { data: allBookedDeleted, error: sumError } = await supabase
    .from('booked_dates')
    .delete()
    .eq('travel_date_id', travel_date_id)
  if (sumError) {
    throw createError({
      statusCode: 500,
      statusMessage: sumError.message,
    })
  }

  // Then Delete the row
  const { data: deletedDate, error } = await supabase
    .from('travel_dates')
    .delete()
    .eq('id', travel_date_id)
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return { success: true }
})
