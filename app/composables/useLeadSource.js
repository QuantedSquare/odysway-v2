// Attribution des leads : UTM, plateforme publicitaire (?from-meta / ?from-g-ads)
// et variante du test A/B de la page voyage (/voyages/<slug>/lp).
//
// Tout est rangé dans la clé localStorage historique `utmSource`, déjà lue par le
// devis, le tunnel et la newsletter pour remplir le champ `utm` du deal AC :
//   utm_source=facebook&utm_campaign=laponie&from=meta&variante=B
// La chaîne n'est réécrite que lorsqu'une nouvelle visite porte au moins un de ces
// paramètres (dernier contact « marqué », comme avant).
//
// En parallèle, la visite (UTM, click ids, référent, page d'arrivée) part vers
// POST /api/v1/tracking/touch, qui la range dans des cookies first-party posés par
// le serveur (13 mois, hors de portée du plafond de 7 jours de Safari). Le serveur
// les relit quand le prospect laisse son email et fige l'attribution du deal
// (première et dernière visite, canal) dans `deal_attribution` :
// server/utils/attribution.js.
//
// Un rendez-vous Cal.com crée son deal chez ActiveCampaign sans passer par nous :
// à la réservation, `recordRdv` envoie l'email du participant au serveur, qui met
// l'attribution en attente du deal (server/utils/attributionRdv.js).

import { resolveVoyageVariant } from '~/utils/rdvVariant'

const UTM_STORAGE_KEY = 'utmSource'

const firstValue = value => (Array.isArray(value) ? value[0] : value) ?? ''

const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'fbclid']
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
// Une visite sans marqueur n'est envoyée qu'une fois par session de navigation.
const TOUCH_SESSION_KEY = 'odyTouchSent'
// Id de l'événement de lead, partagé avec le `generate_lead` envoyé par le serveur
// à la création du deal (Meta déduplique sur event_id). Cookie court : il ne sert
// qu'à la requête de création qui suit.
const LEAD_EVENT_COOKIE = 'ody_leid'

// Les campagnes marquent leurs liens avec ?from-meta ou ?from-g-ads. Les click ids
// (fbclid, gclid…) ajoutés automatiquement par les régies servent de filet.
export function detectAdPlatform(query = {}) {
  const from = String(firstValue(query.from)).toLowerCase()
  if ('from-meta' in query || from === 'meta' || 'fbclid' in query) return 'meta'
  if ('from-g-ads' in query || from === 'g-ads' || 'gclid' in query || 'gbraid' in query || 'wbraid' in query) return 'g-ads'
  return null
}

function readStorage(key) {
  try {
    return localStorage.getItem(key) || ''
  }
  catch {
    return ''
  }
}

function readSession(key) {
  try {
    return sessionStorage.getItem(key)
  }
  catch {
    return null
  }
}

function writeSession(key, value) {
  try {
    sessionStorage.setItem(key, value)
  }
  catch {
    // Stockage bloqué : la visite sera simplement renvoyée à la page suivante.
  }
}

// Référent extérieur uniquement : la navigation interne n'est pas une source.
function externalReferrer() {
  const referrer = document.referrer
  if (!referrer) return ''
  try {
    return new URL(referrer).hostname === window.location.hostname ? '' : referrer
  }
  catch {
    return ''
  }
}

// Les salariés d'Odysway (cookie odysway_employee_optout) ne sont pas des leads.
function estSalarie() {
  return /(?:^|; )odysway_employee_optout=1(?:;|$)/.test(document.cookie)
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value)
  }
  catch {
    // Navigation privée / stockage bloqué : l'attribution est perdue, pas la page.
  }
}

export function useLeadSource() {
  // À appeler une fois au montage de l'app, avec la query et le chemin de la page
  // d'arrivée.
  function captureLeadSource(query = {}, path = '') {
    if (!import.meta.client) return

    const entries = Object.keys(query)
      .filter(key => key.toLowerCase().includes('utm'))
      .map(key => `${key}=${firstValue(query[key])}`)

    const platform = detectAdPlatform(query)
    if (platform) entries.push(`from=${platform}`)

    // Arrivée sur une landing /voyages/<slug>/lp : on marque la variante B.
    if (resolveVoyageVariant(path) === 'B') entries.push('variante=B')

    if (entries.length) {
      writeStorage(UTM_STORAGE_KEY, entries.join('&'))
    }

    recordTouch(query, path, platform)
  }

  // Envoie la visite au serveur (cookies d'attribution). Les règles de classement
  // (canal, première / dernière visite) vivent côté serveur, pas ici.
  function recordTouch(query, path, platform) {
    if (estSalarie()) return

    const touch = { landing: path, ts: Date.now() }
    for (const key of [...UTM_KEYS, ...CLICK_IDS]) {
      const value = firstValue(query[key])
      if (value) touch[key] = String(value)
    }
    if (platform) touch.from = platform
    if (resolveVoyageVariant(path) === 'B') touch.variante = 'B'
    const referrer = externalReferrer()
    if (referrer) touch.referrer = referrer

    const marked = Object.keys(touch).some(key => !['landing', 'ts'].includes(key))
    if (!marked && readSession(TOUCH_SESSION_KEY)) return

    $fetch('/api/v1/tracking/touch', { method: 'POST', body: touch, keepalive: true })
      .then(() => writeSession(TOUCH_SESSION_KEY, '1'))
      .catch(() => {
        // Attribution perdue pour cette visite, pas la page.
      })
  }

  // Réservation Cal.com confirmée (`bookingSuccessful` de l'embed) : le serveur
  // lit les cookies d'attribution de cette requête et les rattache au deal que
  // Cal.com crée dans ActiveCampaign.
  function recordRdv(data) {
    if (!import.meta.client || estSalarie()) return
    const booking = data?.booking || data || {}
    const attendee = Array.isArray(booking.attendees) ? booking.attendees[0] : booking.attendees
    const email = attendee?.email || booking.responses?.email
    if (!email || typeof email !== 'string') return
    $fetch('/api/v1/tracking/rdv', {
      method: 'POST',
      body: { email, bookingUid: booking.uid || data?.uid || null },
      keepalive: true,
    }).catch(() => {
      // Attribution du RDV perdue, pas la réservation.
    })
  }

  // Attribution courante, pour GTM et les métadonnées de réservation Cal.com.
  function getLeadSource() {
    if (!import.meta.client) return { platform: null, raw: '', params: {} }
    const raw = readStorage(UTM_STORAGE_KEY)
    const params = Object.fromEntries(new URLSearchParams(raw))
    return { platform: params.from || null, raw, params }
  }

  // À appeler juste avant d'envoyer l'événement de lead ET la requête qui crée le
  // deal : met l'id dans un cookie (lu par le serveur) et le retourne (pour GTM).
  function newLeadEventId() {
    if (!import.meta.client) return null
    const id = `lead_${globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`
    document.cookie = `${LEAD_EVENT_COOKIE}=${id}; Max-Age=600; Path=/; SameSite=Lax`
    return id
  }

  return { captureLeadSource, getLeadSource, newLeadEventId, recordRdv }
}
