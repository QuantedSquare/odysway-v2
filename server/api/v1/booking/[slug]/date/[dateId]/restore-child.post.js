import { defineEventHandler, createError, readBody } from 'h3'

// Restauration d'une note / pièce jointe / facture supprimée.
// Un seul endpoint pour les trois ressources à faible risque, plutôt que trois
// fichiers quasi identiques.

const RESOURCES = {
  note: 'date_notes',
  attachment: 'date_attachments',
  invoice: 'date_invoices',
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProdEnv = config.public.environment === 'production' && process.env.NODE_ENV === 'production'
  const bookingUser = isProdEnv ? requireBookingUser(event) : getBookingUserOrNull(event)

  const { dateId, slug } = event.context.params
  const { resource, id } = await readBody(event)

  if (!dateId || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug et dateId requis' })
  }
  const table = RESOURCES[resource]
  if (!table) {
    throw createError({
      statusCode: 400,
      statusMessage: `resource doit valoir ${Object.keys(RESOURCES).join(', ')}`,
    })
  }
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id requis' })
  }

  // La date parente doit être active : restaurer une note sous une date
  // supprimée la rendrait invisible de toute façon.
  await booking.requireActiveTravelDate(dateId, slug)

  // Le filtre sur travel_date_id empêche de restaurer une ressource d'une
  // autre date en passant son id.
  const restored = await softDelete.restore(table, q => q
    .eq('id', id)
    .eq('travel_date_id', dateId), { select: '*' })

  if (restored.error) {
    throw createError({ statusCode: 500, statusMessage: restored.error })
  }
  if (!restored.count) {
    throw createError({ statusCode: 404, statusMessage: 'Élément supprimé introuvable pour cette date' })
  }

  await logDateActivity(dateId, bookingUser, 'child_restored', { resource, id })

  return { success: true, resource, item: restored.rows[0] }
})
