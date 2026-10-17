import { randomUUID } from 'node:crypto'
import { createError } from 'h3'

// Documents de voyage de l'Espace Voyageur : l'équipe les dépose et les
// publie depuis Ulysse (jeton de service), les clients les lisent.
//
// Accès client : un document vaut pour un départ (tous les dossiers réservés
// sur cette date) ou pour un dossier. Le compte doit voir le dossier
// (espaceDossiers) ; un invité ne voit pas les documents réservés au
// titulaire. Tout autre cas → 404.

const BUCKET = 'trip-documents'
const DUREE_LIEN_S = 60

const introuvable = () => createError({ statusCode: 404, statusMessage: 'Document introuvable.' })

const echec = (error, contexte) => {
  if (!error) return
  console.error(`[espace/documents] ${contexte}`, error.message)
  throw createError({ statusCode: 500, statusMessage: 'Documents illisibles pour le moment.' })
}

const COLONNES = 'id, travel_date_id, deal_id, type, titre, description, nom_fichier, mime_type, taille, storage_path, reserve_titulaire, publie, publie_le, disponible_le, notifier_clients, notifie_le, depose_par, created_at, updated_at, deleted_at'

// ── Côté client ─────────────────────────────────────────────────────────────

/**
 * Documents publiés des dossiers donnés, par dossier.
 * @param {{ id: string }} client
 * @param {Array<{ deal: object, role: string, reservation: object|null }>} dossiers
 * @returns {Promise<Map<number, object[]>>} dealId → vues client triées
 */
const documentsDesDossiers = async (client, dossiers) => {
  const resultat = new Map(dossiers.map(d => [Number(d.deal.id), []]))
  if (!dossiers.length) return resultat
  const dealIds = dossiers.map(d => Number(d.deal.id))
  const dateIds = [...new Set(dossiers.map(d => d.reservation?.travel_date_id).filter(Boolean))]

  const filtres = [`deal_id.in.(${dealIds.join(',')})`]
  if (dateIds.length) filtres.push(`travel_date_id.in.(${dateIds.join(',')})`)
  const { data: docs, error } = await supabase.from('trip_documents').select(COLONNES)
    .or(filtres.join(',')).eq('publie', true).is('deleted_at', null)
  echec(error, 'lecture des documents')
  if (!docs?.length) return resultat

  const { data: vues } = await supabase.from('trip_document_views').select('document_id')
    .eq('user_id', client.id).in('document_id', docs.map(d => d.id))
  const vus = new Set((vues || []).map(v => v.document_id))
  const aujourdhui = espaceVoyageur.aujourdhuiParis()

  for (const d of dossiers) {
    const liste = docs
      .filter(doc => Number(doc.deal_id) === Number(d.deal.id) || (doc.travel_date_id && doc.travel_date_id === d.reservation?.travel_date_id))
      .filter(doc => espaceDocument.visiblePour(doc, d.role))
      .map(doc => espaceDocument.vueClient(doc, { aujourdhui, vu: vus.has(doc.id) }))
      .filter(v => v.etat)
      .sort(espaceDocument.trier)
    resultat.set(Number(d.deal.id), liste)
  }
  return resultat
}

/** Lien de 60 s vers un document accessible et disponible ; le marque comme vu. */
const lienDocumentClient = async (client, documentId) => {
  const { data: doc, error } = await supabase.from('trip_documents').select(COLONNES).eq('id', documentId).maybeSingle()
  echec(error, 'lecture du document')
  if (!doc || espaceDocument.etatDocument(doc, espaceVoyageur.aujourdhuiParis()) !== 'disponible') throw introuvable()

  const dossiers = await espaceDossiers.dossiersDuCompte(client)
  const accessible = dossiers.some(d =>
    (Number(doc.deal_id) === Number(d.deal.id) || (doc.travel_date_id && doc.travel_date_id === d.reservation?.travel_date_id))
    && espaceDocument.visiblePour(doc, d.role))
  if (!accessible) throw introuvable()

  const { data, error: e2 } = await supabase.storage.from(BUCKET)
    .createSignedUrl(doc.storage_path, DUREE_LIEN_S, { download: espaceDocument.nomTelechargement(doc) })
  echec(e2, 'lien du document')
  await supabase.from('trip_document_views')
    .upsert({ document_id: doc.id, user_id: client.id }, { onConflict: 'document_id,user_id', ignoreDuplicates: true })
  return { url: data.signedUrl, expireDans: DUREE_LIEN_S }
}

// ── Côté équipe (Ulysse) ────────────────────────────────────────────────────

const vueEquipe = doc => ({
  id: doc.id,
  portee: doc.deal_id ? 'dossier' : 'depart',
  dealId: doc.deal_id ? Number(doc.deal_id) : null,
  type: doc.type,
  libelleType: espaceDocument.libelleType(doc.type),
  titre: doc.titre,
  description: doc.description,
  nomFichier: doc.nom_fichier,
  mimeType: doc.mime_type,
  taille: doc.taille,
  reserveTitulaire: doc.reserve_titulaire,
  publie: doc.publie,
  publieLe: doc.publie_le,
  disponibleLe: doc.disponible_le,
  notifierClients: doc.notifier_clients !== false,
  notifieLe: doc.notifie_le || null,
  deposePar: doc.depose_par,
  creeLe: doc.created_at,
})

/** La date doit exister, active ; rend aussi les dossiers qui y sont réservés. */
const dateEtDossiers = async (dateId) => {
  const { data: date, error } = await supabase.from('travel_dates')
    .select('id, travel_slug, deleted, is_test').eq('id', dateId).maybeSingle()
  echec(error, 'lecture de la date')
  if (!date || date.deleted || date.is_test) throw createError({ statusCode: 404, statusMessage: 'Date introuvable.' })
  const { data: resas, error: e2 } = await supabase.from('booked_dates')
    .select('deal_id').eq('travel_date_id', dateId).eq('deleted', false).not('is_test', 'is', true)
  echec(e2, 'réservations de la date')
  return { date, dealIds: [...new Set((resas || []).map(r => Number(r.deal_id)).filter(Boolean))] }
}

/** Documents d'un départ (publiés ou non) : ceux du départ, puis ceux de chaque dossier. */
const documentsDeLaDate = async (dateId) => {
  const { dealIds } = await dateEtDossiers(dateId)
  const filtres = [`travel_date_id.eq.${dateId}`]
  if (dealIds.length) filtres.push(`deal_id.in.(${dealIds.join(',')})`)
  const { data: docs, error } = await supabase.from('trip_documents').select(COLONNES)
    .or(filtres.join(',')).is('deleted_at', null).order('created_at', { ascending: false })
  echec(error, 'documents de la date')

  const { data: deals } = dealIds.length
    ? await supabase.from('activecampaign_deals').select('id, contact').in('id', dealIds)
    : { data: [] }
  const contacts = [...new Set((deals || []).map(d => d.contact).filter(Boolean))]
  const { data: fiches } = contacts.length
    ? await supabase.from('activecampaign_clients').select('contact, firstname, lastname').in('contact', contacts)
    : { data: [] }
  const nomParContact = new Map((fiches || []).map(f => [Number(f.contact), [f.firstname, f.lastname].filter(Boolean).join(' ')]))

  return {
    types: espaceDocument.TYPES,
    depart: (docs || []).filter(d => d.travel_date_id).map(vueEquipe),
    dossiers: dealIds.map(id => ({
      dealId: id,
      client: nomParContact.get(Number((deals || []).find(d => Number(d.id) === id)?.contact)) || null,
      documents: (docs || []).filter(d => Number(d.deal_id) === id).map(vueEquipe),
    })),
  }
}

/**
 * Crée le document (non publié) et rend une URL d'envoi signée, où le
 * navigateur d'Ulysse dépose le fichier. Corps validé par depotDocumentSchema.
 */
const preparerDepot = async (dateId, corps, acteur) => {
  const { dealIds } = await dateEtDossiers(dateId)
  if (corps.dealId && !dealIds.includes(Number(corps.dealId))) {
    throw createError({ statusCode: 400, statusMessage: 'Ce dossier n\'est pas réservé sur ce départ.' })
  }
  const ext = espaceDocument.MIMES[corps.mimeType]
  const chemin = `${corps.dealId ? `dossier-${corps.dealId}` : `depart-${dateId}`}/${randomUUID()}.${ext}`
  const { data: envoi, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(chemin)
  echec(error, 'URL d\'envoi')

  const reserveDefaut = espaceDocument.TYPES.find(t => t.valeur === corps.type)?.reserveTitulaire || false
  const { data: doc, error: e2 } = await supabase.from('trip_documents').insert({
    travel_date_id: corps.dealId ? null : dateId,
    deal_id: corps.dealId || null,
    type: corps.type,
    titre: corps.titre,
    description: corps.description || null,
    nom_fichier: corps.nomFichier,
    mime_type: corps.mimeType,
    taille: corps.taille,
    storage_path: chemin,
    reserve_titulaire: corps.reserveTitulaire ?? reserveDefaut,
    disponible_le: corps.disponibleLe || null,
    notifier_clients: corps.notifier !== false,
    depose_par: acteur.email,
  }).select(COLONNES).single()
  echec(e2, 'création du document')
  return { document: vueEquipe(doc), uploadUrl: envoi.signedUrl, token: envoi.token }
}

const lireDocumentEquipe = async (documentId) => {
  const { data: doc, error } = await supabase.from('trip_documents').select(COLONNES).eq('id', documentId).maybeSingle()
  echec(error, 'lecture du document')
  if (!doc || doc.deleted_at) throw introuvable()
  return doc
}

/** Le fichier a-t-il bien été déposé ? (on ne publie pas un document vide) */
const fichierPresent = async (chemin) => {
  const i = chemin.lastIndexOf('/')
  const { data, error } = await supabase.storage.from(BUCKET).list(chemin.slice(0, i), { search: chemin.slice(i + 1) })
  return !error && (data || []).some(o => o.name === chemin.slice(i + 1))
}

/** Titre, visibilité, disponibilité, publication. Corps validé par modificationDocumentSchema. */
const modifierDocument = async (documentId, corps) => {
  const doc = await lireDocumentEquipe(documentId)
  const maj = { updated_at: new Date().toISOString() }
  if (corps.titre !== undefined) maj.titre = corps.titre
  if (corps.description !== undefined) maj.description = corps.description || null
  if (corps.reserveTitulaire !== undefined) maj.reserve_titulaire = corps.reserveTitulaire
  if (corps.disponibleLe !== undefined) maj.disponible_le = corps.disponibleLe || null
  if (corps.publie === true && !doc.publie) {
    if (!(await fichierPresent(doc.storage_path))) {
      throw createError({ statusCode: 409, statusMessage: 'Le fichier n\'a pas été reçu : déposez-le à nouveau avant de publier.' })
    }
    maj.publie = true
    maj.publie_le = doc.publie_le || new Date().toISOString()
  }
  if (corps.publie === false) maj.publie = false
  if (corps.notifier !== undefined) maj.notifier_clients = corps.notifier
  const { data, error } = await supabase.from('trip_documents').update(maj).eq('id', documentId).select(COLONNES).single()
  echec(error, 'modification du document')

  // Prévenir les clients : tout de suite s'il est disponible, sinon la tâche
  // planifiée le fera le jour de sa disponibilité.
  let notification = null
  if (espaceNotification.aNotifierMaintenant(data, espaceVoyageur.aujourdhuiParis())) {
    notification = await notifierDocument(data)
  }
  else if (data.publie && data.notifier_clients && !data.notifie_le && data.disponible_le) {
    notification = { programmee: String(data.disponible_le).slice(0, 10) }
  }
  return { ...vueEquipe(notification?.envoyes !== undefined ? { ...data, notifie_le: notification.complete ? new Date().toISOString() : null } : data), notification }
}

// ── Notifications email ─────────────────────────────────────────────────────

const PAR_LOT = 5

/** Destinataires d'un document : titulaires des dossiers visibles et, sauf facture, leurs invités. */
const destinatairesDuDocument = async (doc) => {
  let dealIds = doc.deal_id ? [Number(doc.deal_id)] : []
  if (!doc.deal_id) {
    const { data: resas, error } = await supabase.from('booked_dates').select('deal_id')
      .eq('travel_date_id', doc.travel_date_id).eq('deleted', false).not('is_test', 'is', true)
    echec(error, 'réservations du document')
    dealIds = [...new Set((resas || []).map(r => Number(r.deal_id)).filter(Boolean))]
  }
  if (!dealIds.length) return { destinataires: [], titreParDeal: new Map() }

  const { data: deals, error: e2 } = await supabase.from('activecampaign_deals')
    .select('id, contact, title, status, pipeline_id, deleted').in('id', dealIds)
  echec(e2, 'dossiers du document')
  // Les dossiers perdus, supprimés ou à la corbeille ne sont pas prévenus.
  const visibles = (deals || []).filter(d => espaceVoyageur.dealVisible(d, { aUneReservation: true }))
  const contacts = [...new Set(visibles.map(d => d.contact).filter(Boolean))]
  const [{ data: fiches }, { data: voyageurs }] = await Promise.all([
    contacts.length
      ? supabase.from('activecampaign_clients').select('contact, email, firstname, lastname').in('contact', contacts)
      : Promise.resolve({ data: [] }),
    visibles.length
      ? supabase.from('deal_travelers').select('deal_id, email, firstname').in('deal_id', visibles.map(d => d.id)).is('removed_at', null).not('email', 'is', null)
      : Promise.resolve({ data: [] }),
  ])
  const ficheParContact = new Map((fiches || []).map(f => [Number(f.contact), f]))
  const titreParDeal = new Map(visibles.map(d => [Number(d.id), espaceVoyageur.titreVoyage(d.title, ficheParContact.get(Number(d.contact)))]))
  return {
    destinataires: espaceNotification.listeDestinataires({ deals: visibles, fiches: ficheParContact, voyageurs: voyageurs || [], reserveTitulaire: doc.reserve_titulaire }),
    titreParDeal,
  }
}

/**
 * Envoie l'email « nouveau document » à chaque destinataire pas encore prévenu,
 * selon ESPACE_NOTIFICATIONS (coupé par défaut). Un email par adresse et par
 * document, jamais deux (trip_document_notifications). Le document est marqué
 * notifié si rien n'a échoué ; sinon la tâche planifiée retentera les échecs.
 */
const notifierDocument = async (doc) => {
  const { mode, adresse } = espaceNotification.modeNotifications(process.env.ESPACE_NOTIFICATIONS)
  const { destinataires, titreParDeal } = await destinatairesDuDocument(doc)
  const { data: deja } = await supabase.from('trip_document_notifications').select('email, statut').eq('document_id', doc.id)
  const faits = new Set((deja || []).filter(r => r.statut !== 'echec').map(r => r.email))
  const aFaire = destinataires.filter(d => !faits.has(d.email))
  const lien = `${useRuntimeConfig().public.siteURL}/mon-espace/documents`
  const compte = { mode, destinataires: destinataires.length, envoyes: 0, rediriges: 0, ignores: 0, echecs: 0 }

  const traiter = async (d) => {
    let statut = 'ignore'
    let detail = mode === 'coupe' ? 'ESPACE_NOTIFICATIONS absent : rien envoyé' : null
    if (mode !== 'coupe') {
      const contenu = espaceEmails.nouveauDocument({ prenom: d.prenom, titreDocument: doc.titre, titreVoyage: titreParDeal.get(d.dealId), lien })
      try {
        if (mode === 'redirection') {
          // Le sujet dit à qui l'email serait parti, pour la recette.
          await brevo.envoyerEmail({ to: adresse, subject: `[Recette → ${d.email}] ${contenu.subject}`, html: contenu.html })
          statut = 'redirige'
          detail = `vers ${adresse}`
        }
        else {
          await brevo.envoyerEmail({ to: d.email, ...contenu })
          statut = 'envoye'
        }
      }
      catch (err) {
        statut = 'echec'
        detail = String(err?.message || err).slice(0, 300)
      }
    }
    await supabase.from('trip_document_notifications').upsert(
      { document_id: doc.id, email: d.email, deal_id: d.dealId, statut, detail, created_at: new Date().toISOString() },
      { onConflict: 'document_id,email' },
    )
    compte[{ envoye: 'envoyes', redirige: 'rediriges', ignore: 'ignores', echec: 'echecs' }[statut]]++
  }

  for (let i = 0; i < aFaire.length; i += PAR_LOT) await Promise.all(aFaire.slice(i, i + PAR_LOT).map(traiter))

  compte.complete = compte.echecs === 0
  if (compte.complete) {
    await supabase.from('trip_documents').update({ notifie_le: new Date().toISOString() }).eq('id', doc.id)
  }
  console.log(`[espace/documents] notification ${doc.id} :`, JSON.stringify(compte))
  return compte
}

/** Tâche planifiée : documents arrivés à leur date de disponibilité, et échecs à retenter. */
const notifierDocumentsEnAttente = async () => {
  const aujourdhui = espaceVoyageur.aujourdhuiParis()
  const { data: docs, error } = await supabase.from('trip_documents').select(COLONNES)
    .eq('publie', true).eq('notifier_clients', true).is('notifie_le', null).is('deleted_at', null)
    .or(`disponible_le.is.null,disponible_le.lte.${aujourdhui}`)
    .limit(50)
  echec(error, 'documents à notifier')
  const resultats = []
  for (const doc of docs || []) {
    try {
      resultats.push({ document: doc.id, ...(await notifierDocument(doc)) })
    }
    catch (err) {
      console.error('[espace/documents] notification impossible', doc.id, err?.message)
      resultats.push({ document: doc.id, erreur: err?.message })
    }
  }
  return { documents: resultats.length, resultats }
}

/** Retire le document des espaces et supprime son fichier ; la ligne reste pour la trace. */
const supprimerDocument = async (documentId, acteur) => {
  const doc = await lireDocumentEquipe(documentId)
  const { error } = await supabase.from('trip_documents')
    .update({ deleted_at: new Date().toISOString(), deleted_by: acteur.email, publie: false })
    .eq('id', documentId)
  echec(error, 'suppression du document')
  const { error: e2 } = await supabase.storage.from(BUCKET).remove([doc.storage_path])
  if (e2) console.error('[espace/documents] fichier non supprimé', doc.storage_path, e2.message)
  return { supprime: true }
}

/** Lien de 60 s pour que l'équipe vérifie un document, publié ou non. */
const lienDocumentEquipe = async (documentId) => {
  const doc = await lireDocumentEquipe(documentId)
  const { data, error } = await supabase.storage.from(BUCKET)
    .createSignedUrl(doc.storage_path, DUREE_LIEN_S, { download: espaceDocument.nomTelechargement(doc) })
  if (error) throw createError({ statusCode: 404, statusMessage: 'Fichier absent : le dépôt n\'a peut-être pas abouti.' })
  return { url: data.signedUrl, expireDans: DUREE_LIEN_S }
}

export default {
  BUCKET,
  documentsDesDossiers,
  lienDocumentClient,
  documentsDeLaDate,
  preparerDepot,
  modifierDocument,
  supprimerDocument,
  lienDocumentEquipe,
  notifierDocument,
  notifierDocumentsEnAttente,
}
