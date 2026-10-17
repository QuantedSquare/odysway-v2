import acReessais from './acReessais.js'

// File des webhooks AC « deal mis à jour » (table ac_deal_sync_queue,
// supabase/migrations/20261007120000_ac_deal_sync_queue.sql).
//
// Le webhook enfile puis traite aussitôt si personne ne tient déjà le deal ;
// sinon il rend la main, et celui qui le tient repasse une fois avec la
// dernière charge. Une rafale de 5 webhooks donne 2 traitements, pas 5.
//
// Un échec passager (AC en panne, Supabase injoignable) laisse le deal en file,
// repris par le cron `ac-deal-sync` (POST /api/v1/ac/file/traiter) après
// DELAIS_S. Slack n'est prévenu qu'au MAX_ESSAIS-ième échec, ou tout de suite
// pour une erreur définitive (deal introuvable chez AC, charge invalide).
//
// Les fonctions pures (delaiAvantEssai, classer) sont testées dans
// tests/unit/fileDeals.test.mjs.

// Bail d'une prise : au-delà de la durée maximale d'une fonction Vercel (300 s),
// pour qu'un traitement en cours ne soit jamais repris en double.
const BAIL_S = 320
// Délai avant l'essai suivant, selon le nombre d'échecs déjà subis.
const DELAIS_S = [60, 120, 300, 900, 1800, 3600]
const MAX_ESSAIS = DELAIS_S.length
// Passages d'un même deal dans un webhook : le sien, puis un pour la rafale.
const PASSAGES_WEBHOOK = 2

/** Secondes avant le prochain essai, après `essais` échecs (1 = premier échec). */
const delaiAvantEssai = essais => DELAIS_S[Math.min(Math.max(essais, 1), DELAIS_S.length) - 1]

/**
 * 'passagere' : à rejouer plus tard. 'definitive' : rejouer n'y changera rien.
 * Une panne d'AC peut arriver nue (axios) ou enveloppée (createError avec
 * `cause`, ex. upsertContactIntoSupabase).
 */
const classer = (erreur) => {
  if (acReessais.panneAc(erreur) || acReessais.panneAc(erreur?.cause)) return 'passagere'
  if (erreur?.isAxiosError) return 'definitive'
  const statut = erreur?.statusCode
  if (statut && statut < 500) return 'definitive'
  return 'passagere'
}

const rpc = async (fonction, args) => {
  const { data, error } = await supabase.rpc(fonction, args)
  if (error) throw new Error(`${fonction}: ${error.message}`)
  return data
}

const enfiler = ({ dealId, contactId, body, eventTime }) =>
  rpc('ac_deal_sync_enfiler', {
    p_deal_id: +dealId,
    p_contact_id: +contactId,
    p_body: body || {},
    p_event_time: eventTime || null,
  })

/** Lignes prises sous bail : un deal précis (`dealId`) ou les `limite` plus anciennes dues. */
const prendre = ({ dealId = null, limite = 1 } = {}) =>
  rpc('ac_deal_sync_prendre', { p_deal_id: dealId === null ? null : +dealId, p_limite: limite, p_bail_secondes: BAIL_S })

const alerter = (ligne, erreur, message) =>
  funnelReporter.reportFunnelError({
    code: 'AC_DEAL_SYNC_FAILED',
    step: 'unknown',
    source: 'server',
    severity: 'error',
    origin: { endpoint: '/api/v1/ac/webhooks/dealUpdate', statusCode: erreur?.response?.status || erreur?.statusCode },
    message,
    context: { dealId: ligne.deal_id },
    raw: { name: erreur?.name, message: erreur?.message, stack: erreur?.stack },
  })

/**
 * Traite une ligne prise. Rend 'fait', 'relance' (redemandé pendant le
 * traitement : à reprendre aussitôt), 'reporte' ou 'abandonne'.
 */
const traiterLigne = async (ligne) => {
  try {
    const { resultat } = await dealUpdateTraitement.traiter({
      dealId: String(ligne.deal_id),
      contactId: String(ligne.contact_id),
      body: ligne.body,
      eventTime: ligne.event_time,
    })
    const retiree = await rpc('ac_deal_sync_terminer', { p_deal_id: ligne.deal_id, p_requested_at: ligne.requested_at })
    console.log(`[fileDeals] deal ${ligne.deal_id} traité (${resultat})${retiree ? '' : ', redemandé entre-temps'}`)
    return retiree ? 'fait' : 'relance'
  }
  catch (erreur) {
    const statut = erreur?.response?.status || erreur?.statusCode || erreur?.code
    const detail = `${statut ? `(${statut}) ` : ''}${erreur?.message || erreur}`
    console.error(`[fileDeals] deal ${ligne.deal_id} en échec :`, erreur)

    if (classer(erreur) === 'definitive') {
      await rpc('ac_deal_sync_terminer', { p_deal_id: ligne.deal_id, p_requested_at: ligne.requested_at })
      await alerter(ligne, erreur, `Webhook dealUpdate abandonné, erreur définitive — deal ${ligne.deal_id} : ${detail}`)
      return 'abandonne'
    }

    const essais = await rpc('ac_deal_sync_echec', {
      p_deal_id: ligne.deal_id,
      p_erreur: detail,
      p_delai_secondes: delaiAvantEssai(ligne.attempts + 1),
    })
    // Une seule alerte, au dernier palier ; la ligne reste en file et continue
    // d'être retentée toutes les heures.
    if (essais === MAX_ESSAIS) {
      await alerter(ligne, erreur, `Deal ${ligne.deal_id} non synchronisé après ${essais} essais (AC en panne ?) — toujours en file : ${detail}`)
    }
    return 'reporte'
  }
}

/** Pour le webhook : enfile, puis traite le deal s'il est libre et dû. */
const enfilerEtTraiter = async (evenement) => {
  await enfiler(evenement)
  let issue = 'en_file'
  for (let passage = 0; passage < PASSAGES_WEBHOOK; passage++) {
    const [ligne] = await prendre({ dealId: evenement.dealId })
    if (!ligne) break
    issue = await traiterLigne(ligne)
    if (issue !== 'relance') break
  }
  return issue
}

/**
 * Pour le cron : traite les deals dus un par un, tant qu'il reste du temps.
 * Prendre une ligne à la fois : aucune ne reste sous bail sans être traitée.
 */
const vider = async ({ budgetMs = 240000, limite = 50 } = {}) => {
  const fin = Date.now() + budgetMs
  const bilan = { fait: 0, relance: 0, reporte: 0, abandonne: 0 }
  for (let n = 0; n < limite && Date.now() < fin; n++) {
    const [ligne] = await prendre()
    if (!ligne) break
    bilan[await traiterLigne(ligne)] += 1
  }
  return bilan
}

export default { BAIL_S, DELAIS_S, MAX_ESSAIS, delaiAvantEssai, classer, enfiler, enfilerEtTraiter, vider }
