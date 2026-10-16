// Attribution des leads : d'où vient un prospect, figé quand il laisse son email.
//
// Le site enregistre chaque arrivée marquée (UTM, click id, site référent) par
// POST /api/v1/tracking/touch, qui la range dans deux cookies first-party posés
// par le serveur (un cookie posé en JavaScript est effacé par Safari au bout de
// 7 jours, un cookie HTTP de notre domaine tient 13 mois) :
//   - `ody_ft` : première visite connue, jamais réécrite ;
//   - `ody_lt` : dernière visite porteuse d'un signal (une visite directe ne
//     l'écrase pas : « dernier contact non direct »).
// À la création du deal, le serveur relit ces cookies, classe chaque visite en
// canal et écrit une ligne `deal_attribution` (voir attributionDeal.js).
//
// Pure : aucun appel réseau, aucun import automatique de Nitro, testée par
// tests/unit/attribution.test.mjs (`npm run test:unit`).

const COOKIE_PREMIERE = 'ody_ft'
const COOKIE_DERNIERE = 'ody_lt'
// 13 mois : durée maximale admise par la CNIL pour un cookie de mesure.
const DUREE_COOKIE = 60 * 60 * 24 * 395

const LONGUEUR_MAX = 200
const CHAMPS_TEXTE = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'gbraid', 'wbraid', 'fbclid', 'from', 'variante', 'landing', 'referrer',
]

const texte = (v) => {
  if (v === undefined || v === null) return null
  const s = String(Array.isArray(v) ? v[0] : v).trim()
  return s ? s.slice(0, LONGUEUR_MAX) : null
}

// Hôte d'une URL, sans « www. » ; null si l'URL est illisible.
const hote = (url) => {
  if (!url) return null
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  }
  catch {
    return null
  }
}

const finitPar = (host, domaines) => !!host && domaines.some(d => host === d || host.endsWith(`.${d}`))

// Retours de paiement et d'outils du tunnel : ce ne sont pas des sources.
const REFERENTS_IGNORES = ['odysway.com', 'stripe.com', 'getalma.eu', 'almapay.com', 'cal.com', 'localhost']
const MOTEURS = ['google', 'bing', 'duckduckgo', 'qwant', 'ecosia', 'yahoo', 'yandex', 'baidu', 'lilo', 'startpage', 'brave']
const RESEAUX = ['facebook.com', 'fb.com', 'fb.me', 'instagram.com', 'linkedin.com', 'lnkd.in', 't.co', 'twitter.com', 'x.com', 'pinterest.com', 'pinterest.fr', 'youtube.com', 'tiktok.com', 'threads.net', 'reddit.com']
const IA = ['chatgpt.com', 'openai.com', 'perplexity.ai', 'claude.ai', 'gemini.google.com', 'copilot.microsoft.com', 'mistral.ai']
const MESSAGERIES = ['mail.google.com', 'outlook.live.com', 'outlook.office.com', 'mail.yahoo.com', 'webmail.free.fr', 'mail.orange.fr']
const MEDIUMS_PAYANTS = ['cpc', 'ppc', 'paid', 'paid_social', 'paidsocial', 'paid-social', 'cpm', 'cpa', 'ads', 'display', 'sea', 'retargeting']
const SOURCES_META = ['facebook', 'fb', 'instagram', 'ig', 'meta']
const SOURCES_GOOGLE = ['google', 'adwords', 'google_ads', 'googleads', 'youtube']
const SOURCES_EMAIL = ['brevo', 'sendinblue', 'activecampaign', 'newsletter', 'email', 'mailchimp']

const moteur = host => !!host && MOTEURS.some(m => host === `${m}.com` || host.startsWith(`${m}.`) || host.includes(`.${m}.`))
  && !finitPar(host, ['mail.google.com', 'gemini.google.com'])

/** Ne garde d'une visite envoyée par le navigateur que les champs connus, bornés. */
const nettoyerVisite = (brut = {}) => {
  const visite = {}
  for (const champ of CHAMPS_TEXTE) {
    const v = texte(brut?.[champ])
    if (v) visite[champ] = v
  }
  // Seul un site extérieur est un référent.
  if (visite.referrer && (!hote(visite.referrer) || finitPar(hote(visite.referrer), REFERENTS_IGNORES))) {
    delete visite.referrer
  }
  const ts = Number(brut?.ts)
  visite.ts = Number.isFinite(ts) && ts > 0 ? Math.floor(ts) : Date.now()
  return visite
}

/**
 * Canal d'une visite. `fbclid` seul ne suffit pas à dire « Meta Ads » : Facebook et
 * Instagram l'ajoutent à TOUS les liens sortants, publicités ou non. Une pub Meta
 * se reconnaît à `?from-meta` (le marquage de nos campagnes) ou à un utm payant.
 * `gclid`/`gbraid`/`wbraid` n'existent que sur un clic Google Ads.
 */
const classerVisite = (visite = {}) => {
  const source = (visite.utm_source || '').toLowerCase()
  const medium = (visite.utm_medium || '').toLowerCase()
  const from = (visite.from || '').toLowerCase()
  const referent = hote(visite.referrer)
  const payant = MEDIUMS_PAYANTS.includes(medium)

  let canal
  if (visite.gclid || visite.gbraid || visite.wbraid || from === 'g-ads' || (payant && SOURCES_GOOGLE.includes(source))) {
    canal = 'Google Ads'
  }
  else if (from === 'meta' || (payant && SOURCES_META.includes(source))) {
    canal = 'Meta Ads'
  }
  else if (payant) {
    canal = 'Autre payant'
  }
  else if (medium === 'email' || medium === 'newsletter' || SOURCES_EMAIL.includes(source)) {
    canal = 'Email'
  }
  else if (medium === 'social' || SOURCES_META.includes(source) || visite.fbclid) {
    canal = 'Réseaux sociaux'
  }
  else if (source || medium || visite.utm_campaign) {
    canal = 'Autre campagne'
  }
  else if (finitPar(referent, IA)) {
    canal = 'IA'
  }
  else if (finitPar(referent, MESSAGERIES)) {
    canal = 'Email'
  }
  else if (moteur(referent)) {
    canal = 'SEO'
  }
  else if (finitPar(referent, RESEAUX)) {
    canal = 'Réseaux sociaux'
  }
  else if (referent) {
    canal = 'Site référent'
  }
  else {
    canal = 'Direct'
  }

  return {
    canal,
    source: visite.utm_source || (from ? from : null) || referent || (visite.fbclid ? 'facebook' : null) || (canal === 'Direct' ? '(direct)' : null),
    medium: visite.utm_medium || null,
    campagne: visite.utm_campaign || null,
  }
}

/** Une visite porte-t-elle un signal d'acquisition (autre chose qu'une visite directe) ? */
const porteUnSignal = visite => classerVisite(visite).canal !== 'Direct'

const encoderCookie = visite => Buffer.from(JSON.stringify(visite), 'utf8').toString('base64url')

const decoderCookie = (valeur) => {
  if (!valeur) return null
  try {
    const visite = JSON.parse(Buffer.from(String(valeur), 'base64url').toString('utf8'))
    return visite && typeof visite === 'object' && !Array.isArray(visite) ? nettoyerVisite(visite) : null
  }
  catch {
    return null
  }
}

/**
 * Cookies à poser après une nouvelle visite : la première visite n'est écrite
 * qu'une fois ; la dernière est remplacée par toute visite porteuse d'un signal.
 * Retourne { premiere, derniere } (null = ne pas toucher au cookie).
 */
const cookiesApresVisite = ({ premiereActuelle, derniereActuelle, visite }) => ({
  premiere: premiereActuelle ? null : visite,
  derniere: !derniereActuelle || porteUnSignal(visite) ? visite : null,
})

// `_ga` = « GA1.1.<id>.<horodatage> » → client_id GA4 « <id>.<horodatage> ».
const clientIdGa = (ga) => {
  const morceaux = String(ga || '').split('.')
  return morceaux.length >= 4 ? morceaux.slice(-2).join('.') : null
}

// `_gcl_aw` (Google Ads, posé par le tag de conversion) = « GCL.<horodatage>.<gclid> ».
const gclidDuCookie = (gcl) => {
  const morceaux = String(gcl || '').split('.')
  return morceaux.length >= 3 ? morceaux.slice(2).join('.') : null
}

const date = ts => (Number.isFinite(ts) ? new Date(ts).toISOString() : null)

const colonnesVisite = (prefixe, visite) => {
  const c = visite ? classerVisite(visite) : {}
  return {
    [`${prefixe}_channel`]: c.canal ?? null,
    [`${prefixe}_source`]: c.source ?? null,
    [`${prefixe}_medium`]: c.medium ?? null,
    [`${prefixe}_campaign`]: c.campagne ?? null,
    [`${prefixe}_content`]: visite?.utm_content ?? null,
    [`${prefixe}_term`]: visite?.utm_term ?? null,
    [`${prefixe}_landing`]: visite?.landing ?? null,
    [`${prefixe}_referrer`]: visite?.referrer ?? null,
    [`${prefixe}_at`]: visite ? date(visite.ts) : null,
  }
}

/**
 * Ligne `deal_attribution` d'un deal, à partir des cookies de la requête qui crée
 * le deal. `cookies` : objet nom → valeur (parseCookies de h3).
 * Sans cookie d'attribution (navigateur qui n'a pas encore appelé /tracking/touch,
 * cookies bloqués…), les colonnes de visite restent null : « inconnu », pas « Direct ».
 */
const ligneAttribution = ({ dealId, formulaire = null, cookies = {}, requete = {} }) => {
  const premiere = decoderCookie(cookies[COOKIE_PREMIERE])
  const derniere = decoderCookie(cookies[COOKIE_DERNIERE]) || premiere

  // Click ids : le plus récent connu, la dernière visite primant sur la première.
  const clic = champ => derniere?.[champ] || premiere?.[champ] || null
  const gclid = clic('gclid') || gclidDuCookie(cookies._gcl_aw)
  const fbclid = clic('fbclid')
  const visiteFbclid = derniere?.fbclid ? derniere : premiere
  const fbc = texte(cookies._fbc) || (fbclid ? `fb.1.${visiteFbclid.ts}.${fbclid}` : null)

  return {
    deal_id: Number(dealId),
    formulaire: texte(formulaire),
    ...colonnesVisite('first', premiere),
    ...colonnesVisite('last', derniere),
    gclid,
    gbraid: clic('gbraid'),
    wbraid: clic('wbraid'),
    fbclid,
    fbc,
    fbp: texte(cookies._fbp),
    ga_client_id: clientIdGa(cookies._ga),
    variante: clic('variante'),
    // IP et navigateur du visiteur au moment du lead, renvoyés avec l'achat :
    // celui-ci part du webhook de paiement, sans visiteur, et le Data Client
    // prendrait sinon l'IP du serveur. `consent_ads` n'est plus écrit : il n'y a
    // plus de bannière, tout visiteur est traité comme consentant
    // (docs/tracking-acquisition.md).
    client_ip: texte(requete.ip),
    client_user_agent: texte(requete.userAgent),
    touches: premiere || derniere ? { first: premiere, last: derniere } : null,
  }
}

export default {
  COOKIE_PREMIERE,
  COOKIE_DERNIERE,
  DUREE_COOKIE,
  nettoyerVisite,
  classerVisite,
  porteUnSignal,
  encoderCookie,
  decoderCookie,
  cookiesApresVisite,
  ligneAttribution,
}
