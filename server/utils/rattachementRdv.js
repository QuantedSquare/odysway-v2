// Règles de rapprochement entre un RDV Cal.com capturé par le navigateur et le
// deal qu'ActiveCampaign crée pour lui (voir attributionRdv.js).
//
// L'intégration Cal.com → AC crée le deal dans « RDV Calendly Pris » quand le
// contact est nouveau, et déplace son deal existant sinon. Seul le premier cas
// est une ENTRÉE par RDV : le deal doit être né autour de la réservation. Un
// deal existant déplacé en RDV garde son origine, et l'attribution qu'il a
// peut-être déjà.
//
// Pure : aucun import, testée par tests/unit/rattachementRdv.test.mjs.

const FORMULAIRE = 'RDV'

// Le deal peut naître un peu avant que le navigateur ne signale la réservation
// (l'intégration est serveur à serveur), ou après (intégration en différé).
const AVANT_MS = 2 * 60 * 60 * 1000
const APRES_MS = 24 * 60 * 60 * 1000

// Au-delà, une capture jamais rattachée est effacée : son deal ne viendra plus.
const RETENTION_JOURS = 30

const PIPELINES = [1, 2, 5]

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/

/** Email en minuscules, ou null s'il n'en est pas un. */
const emailNormalise = (valeur) => {
  const s = String(valeur ?? '').trim().toLowerCase()
  return s.length <= 254 && EMAIL_RE.test(s) ? s : null
}

/** uid de réservation Cal.com, ou null s'il est illisible. */
const uidReservation = (valeur) => {
  const s = String(valeur ?? '').trim()
  return /^[\w-]{6,100}$/.test(s) ? s : null
}

const normaliser = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

/** « RDV Calendly Pris » : le stage où Cal.com crée ou déplace le deal. */
const estStageRdv = stage => /^rdv calendly/.test(normaliser(stage))

/** Le deal est-il né dans la fenêtre de la réservation ? */
const dansLaFenetre = (dealCreeLe, captureLe) => {
  const d = Date.parse(dealCreeLe)
  const c = Date.parse(captureLe)
  return Number.isFinite(d) && Number.isFinite(c) && d >= c - AVANT_MS && d <= c + APRES_MS
}

/**
 * Le deal peut-il encore avoir une capture qui l'attend ? Sinon, inutile de la
 * chercher en base à chaque webhook.
 */
const peutAvoirUneCapture = (dealCreeLe, maintenant = Date.now()) => {
  const d = Date.parse(dealCreeLe)
  return Number.isFinite(d) && d >= maintenant - (RETENTION_JOURS * 24 * 60 * 60 * 1000 + APRES_MS)
}

/** Un deal RDV d'une pipeline suivie, né dans la fenêtre de la capture. */
const correspond = (deal, captureLe) =>
  PIPELINES.includes(Number(deal?.pipeline_id))
  && estStageRdv(deal?.stage)
  && dansLaFenetre(deal?.created_at, captureLe)

const ecart = (a, b) => Math.abs(Date.parse(a) - Date.parse(b))

/** Deal d'une capture parmi ceux de son contact : le plus proche de la réservation. */
const choisirDeal = (deals, captureLe) =>
  (deals || [])
    .filter(d => correspond(d, captureLe))
    .sort((a, b) => ecart(a.created_at, captureLe) - ecart(b.created_at, captureLe))[0] ?? null

/** Capture d'un deal parmi celles qui attendent son email : la plus proche de sa création. */
const choisirCapture = (captures, deal) =>
  (captures || [])
    .filter(c => correspond(deal, c.capture_le))
    .sort((a, b) => ecart(a.capture_le, deal.created_at) - ecart(b.capture_le, deal.created_at))[0] ?? null

export default {
  FORMULAIRE,
  RETENTION_JOURS,
  emailNormalise,
  uidReservation,
  estStageRdv,
  dansLaFenetre,
  peutAvoirUneCapture,
  choisirDeal,
  choisirCapture,
}
