// Attribution des leads : UTM, plateforme publicitaire (?from-meta / ?from-g-ads)
// et variante du test A/B de la page voyage (/voyages/<slug>/lp).
//
// Tout est rangé dans la clé localStorage historique `utmSource`, déjà lue par le
// devis, le tunnel et la newsletter pour remplir le champ `utm` du deal AC :
//   utm_source=facebook&utm_campaign=laponie&from=meta&variante=B
// La chaîne n'est réécrite que lorsqu'une nouvelle visite porte au moins un de ces
// paramètres (dernier contact « marqué », comme avant).

import { resolveVoyageVariant } from '~/utils/rdvVariant'

const UTM_STORAGE_KEY = 'utmSource'

const firstValue = value => (Array.isArray(value) ? value[0] : value) ?? ''

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
  }

  // Attribution courante, pour GTM et les métadonnées de réservation Cal.com.
  function getLeadSource() {
    if (!import.meta.client) return { platform: null, raw: '', params: {} }
    const raw = readStorage(UTM_STORAGE_KEY)
    const params = Object.fromEntries(new URLSearchParams(raw))
    return { platform: params.from || null, raw, params }
  }

  return { captureLeadSource, getLeadSource }
}
