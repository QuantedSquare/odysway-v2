import { defineEventHandler, readBody, createError } from 'h3'

// Recrée la ligne booked_dates d'un deal orphelin et réécrit son lien de
// paiement dans ActiveCampaign. Déclenché depuis /booking-management/broken-links.
//
// `travelDateId` est facultatif : sans lui on prend la date résolue
// automatiquement (journal d'activité, puis date exacte, puis ±2 jours). Le BMS
// l'envoie explicitement dès que l'opérateur a tranché un cas ambigu.
export default defineEventHandler(async (event) => {
  // Route BMS privée : l'utilisateur est déjà authentifié et posé sur le
  // contexte par server/middleware/bms-auth.js.
  const bookingUser = event.context.bookingUser
  const { dealId, travelDateId } = await readBody(event)

  if (!dealId) {
    throw createError({ statusCode: 400, statusMessage: 'dealId requis.' })
  }

  const deal = await brokenLinks.getDealSnapshot(dealId)
  if (!deal) {
    throw createError({ statusCode: 404, statusMessage: `Deal ${dealId} introuvable dans ActiveCampaign.` })
  }

  let targetDateId = travelDateId
  let source = 'manual'

  if (!targetDateId) {
    const resolution = await brokenLinks.resolveTravelDate(dealId, deal)
    if (!resolution.travelDateId) {
      throw createError({
        statusCode: 409,
        statusMessage: resolution.source === brokenLinks.RESOLUTION_SOURCES.AMBIGUOUS
          ? 'Plusieurs dates possibles : choisissez-en une.'
          : 'Aucune date de départ ne correspond à ce deal.',
      })
    }
    targetDateId = resolution.travelDateId
    source = resolution.source
  }

  const { bookedDate, created, paiementLink } = await brokenLinks.repairDealLink({
    dealId,
    travelDateId: targetDateId,
    deal,
    user: bookingUser,
    reason: 'bms_manual',
  })

  return {
    dealId: Number(dealId),
    bookedId: bookedDate.id,
    travelDateId: targetDateId,
    bookedPlaces: bookedDate.booked_places,
    created,
    source,
    paiementLink,
  }
})
