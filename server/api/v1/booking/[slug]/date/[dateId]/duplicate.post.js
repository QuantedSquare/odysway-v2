import { defineEventHandler } from 'h3'


export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  // Fetch the original date
  const { data: original, error } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('id', dateId)
    .single()
  if (error || !original) return { error: 'Date introuvable' }

  // Prepare new row (omit id, created_at, set booked_seat to 0)
  const rest = { ...original }
  delete rest.id
  delete rest.created_at
  delete rest.booked_seat
  const newDate = { ...rest, booked_seat: 0 }

  // Insert new row
  const { data: inserted, error: insertError } = await supabase
    .from('travel_dates')
    .insert([newDate])
    .select('*')
    .single()
  if (insertError) return { error: insertError.message }
  return inserted
})
