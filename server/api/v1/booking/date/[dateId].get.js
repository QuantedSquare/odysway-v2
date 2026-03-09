import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  if (!dateId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'dateId requis',
    })
  }
  const { data, error } = await supabase
    .from('travel_dates')
    .select('*')
    .eq('id', dateId)
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Date introuvable',
    })
  }
  return data
})
