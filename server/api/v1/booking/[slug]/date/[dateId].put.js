import { defineEventHandler, readBody, createError } from 'h3'
import { createClient } from '@sanity/client'

export default defineEventHandler(async (event) => {
  const { dateId, slug } = event.context.params
  if (!dateId || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'slug et dateId requis',
    })
  }
  const body = await readBody(event)

  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  // Ulysse s'annonce par un jeton de service ; sinon on retombe sur la session
  // booking_token habituelle. Voir getUlysseServiceUser pour la liste des
  // endpoints qui l'acceptent.
  const bookingUser = getUlysseServiceUser(event)
    ?? (isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event))

  // Only allow editable fields
  const updateFields = {}
  const allowed = [
    'published', 'is_indiv_travel', 'departure_date', 'return_date',
    'max_travelers', 'min_travelers', 'include_flight',
    'flight_price', 'badges', 'starting_price',
    'early_bird', 'last_minute',
    // Custom display fields
    'displayed_booked_seat',
    'displayed_status',
    'co_filling',
  ]
  for (const key of allowed) {
    if (body[key] !== undefined) updateFields[key] = body[key]
  }

  // Rattacher la date à un autre voyage (Ulysse, dates « orphelines » dont le
  // slug ne correspond à aucun voyage Sanity). Le slug cible doit exister dans
  // Sanity : une date rattachée à un slug inconnu redeviendrait orpheline.
  // La référence et le préfixe mis en cache par departures.js appartiennent à
  // l'ancien voyage : on les efface, ils seront relus au prochain calcul.
  if (body.travel_slug !== undefined && body.travel_slug !== slug) {
    const cible = typeof body.travel_slug === 'string' ? body.travel_slug.trim() : ''
    if (!/^[A-Za-z0-9][A-Za-z0-9-]{0,199}$/.test(cible)) {
      throw createError({ statusCode: 400, statusMessage: 'travel_slug invalide' })
    }
    const sanityClient = createClient({
      projectId: config.public.sanity.projectId,
      dataset: config.public.sanity.dataset,
      apiVersion: config.public.sanity.apiVersion,
      useCdn: false,
    })
    const voyage = await sanityClient.fetch(
      '*[_type == "voyage" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id }',
      { slug: cible },
    )
    if (!voyage) {
      throw createError({ statusCode: 400, statusMessage: `Aucun voyage publié dans Sanity ne porte le slug « ${cible} ».` })
    }
    updateFields.travel_slug = cible
    updateFields.bms_reference = null
    updateFields.travel_type_prefix = null
  }

  if (!Object.keys(updateFields).length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Aucun champ à mettre à jour',
    })
  }

  // Track "save" click: server-side timestamp + editor
  updateFields.updated_at = new Date().toISOString()
  if (bookingUser?.email) {
    updateFields.last_editor = bookingUser.email
  }

  // Fetch current values for activity diff
  const { data: current } = await supabase
    .from('travel_dates')
    .select([...allowed, 'travel_slug'].join(','))
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .eq('deleted', false)
    .single()

  // Convert badges from string to array if needed
  const { data, error } = await supabase
    .from('travel_dates')
    .update(updateFields)
    .eq('id', dateId)
    .eq('travel_slug', slug)
    .eq('deleted', false)
    .select('*')
    .single()

  if (error || !data) {
    throw createError({
      statusCode: error ? 500 : 404,
      statusMessage: error ? error.message : 'Date introuvable',
    })
  }

  // Log activity with diff of changed fields
  if (current) {
    const changes = {}
    for (const key of Object.keys(updateFields)) {
      if (key === 'updated_at' || key === 'last_editor' || key === 'bms_reference' || key === 'travel_type_prefix') continue
      if (JSON.stringify(current[key]) !== JSON.stringify(updateFields[key])) {
        changes[key] = { old: current[key], new: updateFields[key] }
      }
    }
    if (Object.keys(changes).length) {
      await logDateActivity(dateId, bookingUser, 'updated', changes)
    }
  }

  // Keep automated status and booked_seat in sync
  // co_filling change requires full recalculation; threshold changes only need status recompute
  if ('co_filling' in updateFields) {
    const recomputeRes = await booking.recomputeBookedSeatAndStatus(dateId)
    if (recomputeRes?.error) {
      console.error('Booked seat recompute failed', recomputeRes.error)
    }
  }
  else {
    const statusRes = await booking.recomputeStatusOnly(dateId)
    if (statusRes?.error) {
      console.error('Status recompute failed', statusRes.error)
    }
  }
  return data
})
