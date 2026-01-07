import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
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
  const newDate = { ...rest, booked_seat: 0, status: 'soon_confirmed' }

  // Insert new row
  const { data: inserted, error: insertError } = await supabase
    .from('travel_dates')
    .insert([newDate])
    .select('*')
    .single()
  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message })
  }
  return inserted
})
