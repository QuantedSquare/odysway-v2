import { defineEventHandler, readBody, createError } from 'h3'

// Avant de reprendre une réservation déjà créée (lien `?booked_id=…` ou mémoire
// du navigateur), l'étape « Coordonnées » demande si la personne qui vient de
// saisir ses coordonnées en est la titulaire (repriseReservation.js). Sinon le
// tunnel repart sur une inscription neuve à la même date.
//
// Route publique : ne renvoie que le verdict et la date de départ, jamais les
// coordonnées du titulaire.
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body?.bookedId || !body?.email) {
    throw createError({ statusCode: 400, statusMessage: 'bookedId et email requis' })
  }

  let verdict
  try {
    verdict = await titulaireReservation.verifier(body.bookedId, {
      email: body.email,
      firstname: body.firstname,
      lastname: body.lastname,
    })
  }
  catch (err) {
    throw funnelReporter.funnelCreateError({
      statusCode: 502,
      code: 'REPRISE_TITULAIRE_ILLISIBLE',
      step: 'details',
      origin: { field: 'bookedId', received: body.bookedId },
      message: `Titulaire de la réservation illisible : ${err?.message}`,
    })
  }

  if (!verdict) return { reprenable: false, raison: 'introuvable', travelDateId: null }
  return { reprenable: verdict.reprenable, raison: verdict.raison, travelDateId: verdict.travelDateId }
})
