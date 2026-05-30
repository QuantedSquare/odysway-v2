import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  if (isProdEnv) requireBookingUser(event)

  const { slug } = event.context.params
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug requis' })
  }

  const { pax } = getQuery(event)
  if (!pax) {
    throw createError({ statusCode: 400, statusMessage: 'pax requis (query param)' })
  }

  const { error } = await supabase
    .from('voyage_margins')
    .delete()
    .eq('voyage_slug', slug)
    .eq('pax', Number(pax))

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
