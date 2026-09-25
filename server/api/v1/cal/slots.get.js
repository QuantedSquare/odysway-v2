import { createError, getQuery } from 'h3'

// Prochains créneaux libres d'un event type Cal.com, pour la variante « rendez-vous »
// de la page voyage (test A/B). La clé reste côté serveur ; la réponse est mise en
// cache 5 minutes par calLink pour ne pas appeler Cal.com à chaque visite.
//
// calLink = "<username>/<eventTypeSlug>", le même format que l'embed Cal.

const CAL_API_URL = 'https://api.cal.com/v2/slots'
const CAL_LINK_RE = /^[\w-]{1,64}\/[\w-]{1,64}$/
const TIME_ZONE = 'Europe/Paris'
const LOOKAHEAD_DAYS = 14
const MAX_SLOTS = 12

export default defineCachedEventHandler(async (event) => {
  const { calLink = 'odysway/rendez-vous' } = getQuery(event)
  if (typeof calLink !== 'string' || !CAL_LINK_RE.test(calLink)) {
    throw createError({ statusCode: 400, statusMessage: 'calLink invalide' })
  }
  const [username, eventTypeSlug] = calLink.split('/')

  const start = new Date()
  const end = new Date(start.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000)
  const headers = { 'cal-api-version': '2024-09-04' }
  if (process.env.CAL_API_KEY) headers.Authorization = `Bearer ${process.env.CAL_API_KEY}`

  try {
    const res = await $fetch(CAL_API_URL, {
      headers,
      query: {
        username,
        eventTypeSlug,
        start: start.toISOString(),
        end: end.toISOString(),
        timeZone: TIME_ZONE,
      },
    })

    const slots = Object.values(res?.data || {})
      .flat()
      .map(slot => slot.start)
      .filter(Boolean)
      .sort()
      .slice(0, MAX_SLOTS)

    return { timeZone: TIME_ZONE, slots }
  }
  catch (error) {
    console.error('Cal.com slots error:', error?.statusCode, error?.data || error?.message)
    // Pas de créneaux ≠ page cassée : le composant retombe sur « Voir tous les créneaux ».
    return { timeZone: TIME_ZONE, slots: [] }
  }
}, {
  maxAge: 60 * 5,
  name: 'cal-slots',
  getKey: event => String(getQuery(event).calLink || 'odysway/rendez-vous'),
})
