// Enregistre une visite du site dans les cookies d'attribution (voir
// server/utils/attribution.js). Appelé par le navigateur à l'arrivée sur le site
// (useLeadSource) : les pages sont servies en ISR, le serveur ne voit donc ni la
// query ni le référent de la page — le navigateur les lui transmet ici.
//
// Les cookies sont posés en HTTP par notre domaine, httpOnly : Safari ne les
// plafonne pas à 7 jours comme un cookie posé en JavaScript.

import { defineEventHandler, readBody, getCookie, setCookie, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const visite = attribution.nettoyerVisite(body && typeof body === 'object' ? body : {})

  const { premiere, derniere } = attribution.cookiesApresVisite({
    premiereActuelle: attribution.decoderCookie(getCookie(event, attribution.COOKIE_PREMIERE)),
    derniereActuelle: attribution.decoderCookie(getCookie(event, attribution.COOKIE_DERNIERE)),
    visite,
  })

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: attribution.DUREE_COOKIE,
  }
  if (premiere) setCookie(event, attribution.COOKIE_PREMIERE, attribution.encoderCookie(premiere), options)
  if (derniere) setCookie(event, attribution.COOKIE_DERNIERE, attribution.encoderCookie(derniere), options)

  setResponseStatus(event, 204)
  return null
})
