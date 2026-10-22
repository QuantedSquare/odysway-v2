// Notifications email des documents de voyage de l'Espace Voyageur.
//
// PUR (tests/unit/espaceNotification.test.mjs).

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Mode d'envoi, lu dans ESPACE_NOTIFICATIONS — JAMAIS déduit de
 * l'environnement : `dev` partage la base de prod, une publication de recette
 * écrirait à de vrais clients.
 *   - absent / autre valeur → 'coupe' : rien ne part, tout est journalisé ;
 *   - 'redirection:<email>' → tout part vers cette seule adresse ;
 *   - 'actif' → les clients sont prévenus.
 */
const modeNotifications = (valeur) => {
  const v = String(valeur || '').trim()
  if (v === 'actif') return { mode: 'actif', adresse: null }
  const m = /^redirection:(.+)$/.exec(v)
  if (m && EMAIL.test(m[1].trim())) return { mode: 'redirection', adresse: m[1].trim().toLowerCase() }
  return { mode: 'coupe', adresse: null }
}

/** Un document publié, disponible et pas encore annoncé aux clients. */
const aNotifierMaintenant = (doc, aujourdhui) => !!doc
  && doc.publie && !doc.deleted_at && !doc.notifie_le
  && (!doc.disponible_le || String(doc.disponible_le).slice(0, 10) <= aujourdhui)

/**
 * Le couple (document, adresse) est-il déjà traité dans ce mode ? Un envoi de
 * recette (`redirige`) ne vaut pas pour la production : la base est partagée,
 * le client réel doit encore être prévenu. Un échec est toujours retenté.
 */
const dejaTraite = (statut, mode) => statut === 'envoye' || (mode === 'redirection' && statut === 'redirige')

/**
 * Qui prévenir : le titulaire de chaque dossier (email du contact AC) et,
 * sauf document réservé au titulaire, les voyageurs invités. Une adresse
 * n'apparaît qu'une fois, même si elle porte plusieurs dossiers du départ.
 * @param {{ deals: {id:number, contact:number}[], fiches: Map<number,{email?:string, firstname?:string}>,
 *           voyageurs: {deal_id:number, email?:string|null, firstname?:string|null}[], reserveTitulaire: boolean }} p
 * @returns {{ email: string, prenom: string|null, dealId: number }[]}
 */
const listeDestinataires = ({ deals, fiches, voyageurs = [], reserveTitulaire }) => {
  const vus = new Map()
  const ajouter = (email, prenom, dealId) => {
    const e = String(email || '').trim().toLowerCase()
    if (!EMAIL.test(e) || vus.has(e)) return
    vus.set(e, { email: e, prenom: prenom || null, dealId: Number(dealId) })
  }
  for (const d of deals) {
    const fiche = fiches.get(Number(d.contact))
    ajouter(fiche?.email, fiche?.firstname, d.id)
  }
  if (!reserveTitulaire) {
    const ids = new Set(deals.map(d => Number(d.id)))
    for (const v of voyageurs) if (ids.has(Number(v.deal_id))) ajouter(v.email, v.firstname, v.deal_id)
  }
  return [...vus.values()]
}

/**
 * Aperçu de l'annonce d'un départ : les documents à annoncer et, pour chaque
 * adresse, les documents qu'elle n'a pas encore reçus — UN email par adresse.
 * Les couples déjà traités (journal) sont retirés ; un document sans personne
 * à prévenir reste dans la liste avec `destinataires: 0`.
 * @param {{ documents: {id:string, titre:string, type?:string}[],
 *           destinatairesParDocument: Map<string, {email:string, prenom:string|null, dealId:number}[]>,
 *           journal?: {document_id:string, email:string, statut:string}[], mode: string }} p
 * @returns {{ documents: {id:string, titre:string, type?:string, destinataires:number}[],
 *             destinataires: {email:string, prenom:string|null, dealId:number, documentIds:string[]}[] }}
 */
const regrouperAnnonce = ({ documents, destinatairesParDocument, journal = [], mode }) => {
  const traites = new Set(journal.filter(r => dejaTraite(r.statut, mode)).map(r => `${r.document_id}|${r.email}`))
  const parEmail = new Map()
  const resume = documents.map((doc) => {
    let n = 0
    for (const d of destinatairesParDocument.get(doc.id) || []) {
      if (traites.has(`${doc.id}|${d.email}`)) continue
      n++
      if (!parEmail.has(d.email)) parEmail.set(d.email, { email: d.email, prenom: d.prenom, dealId: d.dealId, documentIds: [] })
      const dest = parEmail.get(d.email)
      if (!dest.prenom && d.prenom) dest.prenom = d.prenom
      dest.documentIds.push(doc.id)
    }
    return { id: doc.id, titre: doc.titre, type: doc.type, destinataires: n }
  })
  return { documents: resume, destinataires: [...parEmail.values()] }
}

export default { modeNotifications, aNotifierMaintenant, dejaTraite, listeDestinataires, regrouperAnnonce }
