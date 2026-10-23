import { createError } from 'h3'

// Dossiers d'un compte de l'Espace Voyageur : rattachement, accès, voyageurs.
//
// Deux façons de voir un dossier :
//   - titulaire : le contact AC du deal est rattaché au compte
//     (client_account_links) — il voit tout, paie, invite ses voyageurs ;
//   - voyageur  : une ligne deal_travelers du deal porte le compte (invité par
//     le titulaire) — il voit le voyage, jamais les montants.
// Tout le reste est refusé. Chaque lecture part du compte, jamais d'un
// identifiant fourni par le navigateur seul.

const { motifEmailExact, voyageursDuDeal, slotTitulaireChoisi, dealVisible } = espaceVoyageur

const COLONNES_DEAL = 'id, contact, title, status, stage, pipeline_id, seller, total_value, total_paid, rest_to_pay, nb_traveler, travel_type, country, iso, slug, departure_date, return_date, travel_book, flight_ticket_bought, deleted'

// Les voyageurs d'un deal sont relus dans AC au plus toutes les 6 heures par
// l'espace ; le webhook dealUpdate les tient à jour entre-temps.
const FRAICHEUR_VOYAGEURS_MS = 6 * 60 * 60 * 1000

const echec = (error, contexte) => {
  if (!error) return
  console.error(`[espace] ${contexte}`, error.message)
  throw createError({ statusCode: 500, statusMessage: 'Lecture impossible pour le moment.' })
}

/**
 * Lie le compte aux contacts AC de son email et aux places où il a été invité.
 * Rejouable à chaque connexion : un lien existant n'est ni dupliqué ni modifié.
 */
const rattacherParEmail = async (client) => {
  const { data: contacts, error } = await supabase
    .from('activecampaign_clients')
    .select('contact')
    .ilike('email', motifEmailExact(client.email))
    .not('deleted', 'is', true)
  echec(error, 'contacts par email')

  const liens = (contacts || []).filter(c => c.contact).map(c => ({
    user_id: client.id,
    ac_contact: c.contact,
    linked_via: 'email',
    linked_email: client.email,
  }))
  if (liens.length) {
    const { error: e } = await supabase.from('client_account_links')
      .upsert(liens, { onConflict: 'user_id,ac_contact', ignoreDuplicates: true })
    echec(e, 'liens par email')
  }

  // Invitations : l'email posé par le titulaire sur une place de voyageur.
  const { error: e2 } = await supabase.from('deal_travelers')
    .update({ user_id: client.id, joined_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('email', client.email)
    .is('user_id', null)
  echec(e2, 'invitations')
}

const contactsDuCompte = async (userId) => {
  const { data, error } = await supabase.from('client_account_links').select('ac_contact').eq('user_id', userId)
  echec(error, 'liens du compte')
  return (data || []).map(l => Number(l.ac_contact))
}

/**
 * Réécrit les voyageurs d'un deal depuis ses champs AC « Voyageur 1..15 ».
 * Ne touche jamais à ce qu'AC ne porte pas (email d'invitation, compte,
 * consentement, place désignée par le titulaire) : l'upsert n'envoie que les
 * colonnes d'identité.
 * @param {number} dealId
 * @param {{ fusion?: object, contact?: { firstname?: string, lastname?: string } }} [p]
 *   fusion : deal AC déjà lu avec ses champs mappés ; contact : le payeur
 */
const synchroniserVoyageurs = async (dealId, { fusion, contact } = {}) => {
  const champs = fusion || await activecampaign.getDealCustomFields(dealId)
  const voyageurs = voyageursDuDeal(champs)
  // « C'est moi » : la place désignée par le titulaire l'emporte sur le nom.
  const { data: choisie, error: e0 } = await supabase.from('deal_travelers')
    .select('slot').eq('deal_id', dealId).eq('holder_manuel', true).maybeSingle()
  echec(e0, 'place du titulaire')
  const titulaire = slotTitulaireChoisi(voyageurs, contact, choisie?.slot)
  const maintenant = new Date().toISOString()

  if (voyageurs.length) {
    const { error } = await supabase.from('deal_travelers').upsert(voyageurs.map(v => ({
      deal_id: dealId,
      slot: v.slot,
      raw: v.raw,
      firstname: v.firstname,
      lastname: v.lastname,
      birthdate: v.birthdate,
      iso: v.iso,
      is_holder: v.slot === titulaire,
      removed_at: null,
      synced_at: maintenant,
      updated_at: maintenant,
    })), { onConflict: 'deal_id,slot' })
    echec(error, 'écriture des voyageurs')
  }

  // Retiré dans AC : marqué, pas supprimé (son compte et son consentement restent).
  let retires = supabase.from('deal_travelers')
    .update({ removed_at: maintenant, synced_at: maintenant, updated_at: maintenant })
    .eq('deal_id', dealId)
    .is('removed_at', null)
  if (voyageurs.length) retires = retires.not('slot', 'in', `(${voyageurs.map(v => v.slot).join(',')})`)
  const { error: e2 } = await retires
  echec(e2, 'voyageurs retirés')

  await useStorage('cache').setItem(`espace:voyageurs:${dealId}`, Date.now())
}

/** Relit dans AC les voyageurs des deals qui n'ont pas été synchronisés depuis 6 heures. */
const voyageursAJour = async (deals) => {
  const cache = useStorage('cache')
  const aRelire = []
  for (const d of deals) {
    const lu = await cache.getItem(`espace:voyageurs:${d.id}`)
    if (!lu || Date.now() - Number(lu) > FRAICHEUR_VOYAGEURS_MS) aRelire.push(d)
  }
  if (!aRelire.length) return

  const contacts = [...new Set(aRelire.map(d => d.contact).filter(Boolean))]
  const { data: fiches } = await supabase.from('activecampaign_clients').select('contact, firstname, lastname').in('contact', contacts)
  const parContact = new Map((fiches || []).map(f => [Number(f.contact), f]))

  // En série : AC limite à 5 requêtes par seconde, et un compte a peu de dossiers.
  for (const d of aRelire) {
    try {
      await synchroniserVoyageurs(d.id, { contact: parContact.get(Number(d.contact)) })
    }
    catch (err) {
      // Les voyageurs affichés restent ceux de la dernière lecture.
      console.error('[espace] voyageurs non relus', d.id, err?.message)
    }
  }
}

/**
 * Tous les dossiers visibles d'un compte, avec leur réservation et leur date.
 * @returns {Promise<Array<{ deal: object, role: 'titulaire'|'voyageur', reservation: object|null, date: object|null }>>}
 */
const dossiersDuCompte = async (client) => {
  const contacts = await contactsDuCompte(client.id)

  const { data: places, error: e1 } = await supabase.from('deal_travelers')
    .select('deal_id').eq('user_id', client.id).is('removed_at', null)
  echec(e1, 'places du compte')
  const dealsInvite = [...new Set((places || []).map(p => Number(p.deal_id)))]

  const lectures = []
  if (contacts.length) lectures.push(supabase.from('activecampaign_deals').select(COLONNES_DEAL).in('contact', contacts))
  if (dealsInvite.length) lectures.push(supabase.from('activecampaign_deals').select(COLONNES_DEAL).in('id', dealsInvite))
  const resultats = await Promise.all(lectures)
  resultats.forEach(r => echec(r.error, 'deals du compte'))

  const parId = new Map()
  for (const r of resultats) for (const d of r.data || []) parId.set(Number(d.id), d)
  if (!parId.size) return []

  const ids = [...parId.keys()]
  const { data: reservations, error: e2 } = await supabase.from('booked_dates')
    .select('id, deal_id, travel_date_id, booked_places, is_option, expiracy_date, payment_type')
    .in('deal_id', ids).eq('deleted', false).not('is_test', 'is', true)
  echec(e2, 'réservations')
  const resaParDeal = new Map((reservations || []).map(r => [Number(r.deal_id), r]))

  const dateIds = [...new Set((reservations || []).map(r => r.travel_date_id).filter(Boolean))]
  let dates = []
  if (dateIds.length) {
    const { data, error } = await supabase.from('travel_dates')
      .select('id, travel_slug, departure_date, return_date, is_indiv_travel, is_custom_travel, deleted')
      .in('id', dateIds)
    echec(error, 'dates')
    dates = data || []
  }
  const dateParId = new Map(dates.map(d => [d.id, d]))

  const contactsSet = new Set(contacts)
  return ids
    .map((id) => {
      const deal = parId.get(id)
      const reservation = resaParDeal.get(id) || null
      return {
        deal,
        role: contactsSet.has(Number(deal.contact)) ? 'titulaire' : 'voyageur',
        reservation,
        date: reservation ? dateParId.get(reservation.travel_date_id) || null : null,
      }
    })
    .filter(x => dealVisible(x.deal, { aUneReservation: !!x.reservation }))
}

/** Le dossier `dealId` s'il est visible par ce compte, sinon 404 (jamais 403 : ne rien révéler). */
const dossierDuCompte = async (client, dealId) => {
  const id = Number.parseInt(dealId, 10)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 404, statusMessage: 'Dossier introuvable.' })
  const dossier = (await dossiersDuCompte(client)).find(d => Number(d.deal.id) === id)
  if (!dossier) throw createError({ statusCode: 404, statusMessage: 'Dossier introuvable.' })
  return dossier
}

const voyageursDuDossier = async (dealId) => {
  const { data, error } = await supabase.from('deal_travelers')
    .select('id, slot, firstname, lastname, birthdate, is_holder, holder_manuel, email, user_id, invited_at, joined_at, visible_groupe')
    .eq('deal_id', dealId).is('removed_at', null).order('slot')
  echec(error, 'voyageurs du dossier')
  return data || []
}

/**
 * Les autres voyageurs du même départ de groupe : seuls ceux qui ont accepté
 * d'apparaître, en prénom + initiale ; les autres sont seulement comptés.
 */
const compagnonsDuDepart = async (dossier) => {
  const { reservation, date } = dossier
  if (!reservation?.travel_date_id || !date || date.is_indiv_travel || date.is_custom_travel) return null

  const { data: autres, error } = await supabase.from('booked_dates')
    .select('deal_id, booked_places')
    .eq('travel_date_id', reservation.travel_date_id)
    .eq('deleted', false).not('is_test', 'is', true).eq('is_option', false)
    .neq('deal_id', dossier.deal.id)
  echec(error, 'réservations du départ')
  const dealIds = (autres || []).map(a => a.deal_id)
  const places = (autres || []).reduce((t, a) => t + (Number(a.booked_places) || 0), 0)
  if (!dealIds.length) return { visibles: [], autres: 0 }

  const { data: visibles, error: e2 } = await supabase.from('deal_travelers')
    .select('firstname, lastname')
    .in('deal_id', dealIds).eq('visible_groupe', true).is('removed_at', null)
  echec(e2, 'compagnons visibles')

  const noms = (visibles || []).map(v => espaceVoyageur.nomPublic(v.firstname, v.lastname)).filter(Boolean)
  return { visibles: noms, autres: Math.max(0, places - noms.length) }
}

export default {
  rattacherParEmail,
  contactsDuCompte,
  synchroniserVoyageurs,
  voyageursAJour,
  dossiersDuCompte,
  dossierDuCompte,
  voyageursDuDossier,
  compagnonsDuDepart,
}
