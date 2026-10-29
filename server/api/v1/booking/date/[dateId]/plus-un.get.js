import { defineEventHandler, createError, getQuery } from 'h3'
import plusUnRegles from '#shared/plusUn.js'

// Ce que le tunnel doit faire d'une réservation de `places` voyageurs sur la
// date (« +1 qui fait baisser la marge », server/utils/plusUn.js) : rien, la
// refuser (« par deux », avec le minimum) ou annoncer le supplément. Route
// publique : seule la décision sort, jamais la marge de la grille.
//
// GET /api/v1/booking/date/:dateId/plus-un?places=1[&booked_id=…]
export default defineEventHandler(async (event) => {
  const { dateId } = event.context.params
  const { places, booked_id: bookedId } = getQuery(event)
  const ajout = Number(places)
  if (!dateId || !Number.isInteger(ajout) || ajout < 1 || ajout > 50) {
    throw createError({ statusCode: 400, statusMessage: 'dateId et places (entier de 1 à 50) requis' })
  }
  try {
    const decision = await plusUn.decisionPour({ travelDateId: dateId, ajout, bookedId: bookedId || null })
    return {
      action: decision.action,
      minimum: decision.minimum ?? null,
      supplement: decision.action === 'supplement' ? decision.supplement : 0,
      message: plusUnRegles.messageTunnel(decision),
    }
  }
  catch (err) {
    // La règle ne doit jamais bloquer le tunnel : le paiement la revérifie.
    console.error(`[plus-un] décision illisible pour ${dateId}:`, err?.message)
    return { action: 'libre', minimum: null, supplement: 0, message: null, indisponible: true }
  }
})
