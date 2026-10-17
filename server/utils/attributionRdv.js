// Attribution des rendez-vous Cal.com pris sur odysway.com.
//
// Le deal d'un RDV ne passe pas par notre serveur : l'intégration Cal.com → AC
// le crée directement dans ActiveCampaign. Le navigateur, lui, voit la
// réservation et porte les cookies d'attribution :
//
//   1. `capturer` (POST /api/v1/tracking/rdv, au `bookingSuccessful` de
//      l'embed) calcule la ligne d'attribution et la range dans
//      `rdv_attribution_attente` ;
//   2. elle est rattachée au deal — tout de suite s'il est déjà dans le miroir,
//      sinon par `rattacherDeal`, appelé par le webhook dealUpdate quand le
//      deal arrive.
//
// Rattacher = insérer dans `deal_attribution` avec le formulaire « RDV », sans
// écraser une attribution existante. Les règles de rapprochement sont dans
// rattachementRdv.js. Rien ici ne lève : une attribution perdue ne doit faire
// échouer ni la page ni le webhook.

import { getHeader, getRequestIP, parseCookies } from 'h3'
import supabase from './supabase'
import attribution from './attribution'
import attributionDeal from './attributionDeal'
import rattachementRdv from './rattachementRdv'

const TABLE = 'rdv_attribution_attente'
// Garde contre un envoi en boucle : au-delà, la capture est ignorée.
const MAX_CAPTURES_PAR_JOUR = 5
const JOUR_MS = 24 * 60 * 60 * 1000

/** Insère la ligne de la capture pour ce deal, puis marque la capture rattachée. */
const rattacher = async (capture, dealId) => {
  const { inseres, error } = await attributionDeal.ecrireLigne({
    ...capture.ligne,
    deal_id: Number(dealId),
    // Arrivée du lead : la réservation, pas le moment du rattachement.
    created_at: capture.capture_le,
  })
  if (error) {
    console.error(`[attribution-rdv] deal ${dealId} : écriture refusée`, error.message || error)
    return null
  }
  const resultat = inseres.length ? 'attribue' : 'deja_attribue'
  const maj = await supabase.from(TABLE)
    .update({ deal_id: Number(dealId), rattache_le: new Date().toISOString(), resultat })
    .eq('id', capture.id)
    .is('rattache_le', null)
  if (maj.error) console.error(`[attribution-rdv] capture ${capture.id} : marquage refusé`, maj.error.message)
  console.log(`[attribution-rdv] deal ${dealId} : ${resultat} (${capture.ligne?.first_channel ?? 'inconnu'} → ${capture.ligne?.last_channel ?? 'inconnu'})`)
  return resultat
}

// `ilike` sans joker : un « _ » d'email ne doit pas valoir n'importe quel caractère.
const motif = email => email.replace(/[\\%_]/g, c => `\\${c}`)

/** Deal RDV du contact, né autour de la réservation, s'il est déjà dans le miroir. */
const chercherDeal = async (email, captureLe) => {
  const { data: contacts, error } = await supabase
    .from('activecampaign_clients')
    .select('contact')
    .ilike('email', motif(email))
  if (error) throw new Error(`contacts : ${error.message}`)
  const ids = (contacts || []).map(c => Number(c.contact)).filter(Boolean)
  if (!ids.length) return null
  const { data: deals, error: e2 } = await supabase
    .from('activecampaign_deals')
    .select('id, created_at, stage, pipeline_id')
    .in('contact', ids)
    .eq('deleted', false)
    .gte('created_at', new Date(Date.parse(captureLe) - JOUR_MS).toISOString())
  if (e2) throw new Error(`deals : ${e2.message}`)
  return rattachementRdv.choisirDeal(deals, captureLe)
}

/**
 * Capture d'une réservation, appelée par le navigateur. Rend un statut :
 * 'invalide', 'limite', 'deja_capture', 'en_attente', 'attribue',
 * 'deja_attribue' ou 'erreur'.
 */
const capturer = async (event, { email, bookingUid }) => {
  const adresse = rattachementRdv.emailNormalise(email)
  if (!adresse) return 'invalide'
  try {
    const { count, error: eCompte } = await supabase.from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('email', adresse)
      .gte('capture_le', new Date(Date.now() - JOUR_MS).toISOString())
    if (eCompte) throw new Error(`comptage : ${eCompte.message}`)
    if ((count ?? 0) >= MAX_CAPTURES_PAR_JOUR) return 'limite'

    // Le deal n'existe pas encore : la ligne attend sans `deal_id`.
    const ligne = attribution.ligneAttribution({
      dealId: 0,
      formulaire: rattachementRdv.FORMULAIRE,
      cookies: parseCookies(event),
      requete: { ip: getRequestIP(event, { xForwardedFor: true }), userAgent: getHeader(event, 'user-agent') },
    })
    delete ligne.deal_id
    const { data: capture, error } = await supabase.from(TABLE)
      .upsert({ email: adresse, booking_uid: rattachementRdv.uidReservation(bookingUid), ligne }, { onConflict: 'booking_uid', ignoreDuplicates: true })
      .select('id, ligne, capture_le')
      .maybeSingle()
    if (error) throw new Error(`capture : ${error.message}`)
    if (!capture) return 'deja_capture'
    console.log(`[attribution-rdv] capture ${capture.id} : ${ligne.first_channel ?? 'inconnu'} → ${ligne.last_channel ?? 'inconnu'}`)

    // Captures orphelines : leur deal ne viendra plus.
    const purge = await supabase.from(TABLE).delete()
      .is('rattache_le', null)
      .lt('capture_le', new Date(Date.now() - rattachementRdv.RETENTION_JOURS * JOUR_MS).toISOString())
    if (purge.error) console.error('[attribution-rdv] purge refusée', purge.error.message)

    // Le deal a pu être créé par Cal.com avant que le navigateur ne nous écrive.
    const deal = await chercherDeal(adresse, capture.capture_le)
    if (!deal) return 'en_attente'
    return (await rattacher(capture, deal.id)) ?? 'erreur'
  }
  catch (err) {
    console.error('[attribution-rdv] capture : échec', err?.message || err)
    return 'erreur'
  }
}

/**
 * Appelé par le webhook dealUpdate une fois le deal recopié : si une capture
 * attend l'email de son contact, elle lui est rattachée.
 */
const rattacherDeal = async ({ dealId, email, creeLe, stage, pipelineId }) => {
  try {
    const adresse = rattachementRdv.emailNormalise(email)
    if (!adresse || !rattachementRdv.estStageRdv(stage) || !rattachementRdv.peutAvoirUneCapture(creeLe)) return null
    const { data, error } = await supabase.from(TABLE)
      .select('id, ligne, capture_le')
      .eq('email', adresse)
      .is('rattache_le', null)
    if (error) throw new Error(error.message)
    const capture = rattachementRdv.choisirCapture(data, { created_at: creeLe, stage, pipeline_id: pipelineId })
    return capture ? await rattacher(capture, dealId) : null
  }
  catch (err) {
    console.error(`[attribution-rdv] deal ${dealId} : rattachement en échec`, err?.message || err)
    return null
  }
}

export default { capturer, rattacherDeal }
