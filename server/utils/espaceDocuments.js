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

const COLONNES = 'id, travel_date_id, deal_id, type, titre, description, nom_fichier, mime_type, taille, storage_path, reserve_titulaire, publie, publie_le, disponible_le, depose_par, created_at, updated_at, deleted_at'

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
  const { data, error } = await supabase.from('trip_documents').update(maj).eq('id', documentId).select(COLONNES).single()
  echec(error, 'modification du document')
  return vueEquipe(data)
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
}
