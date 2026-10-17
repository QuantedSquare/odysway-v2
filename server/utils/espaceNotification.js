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

/** Un document publié, disponible, à annoncer et pas encore annoncé. */
const aNotifierMaintenant = (doc, aujourdhui) => !!doc
  && doc.publie && !doc.deleted_at && doc.notifier_clients !== false && !doc.notifie_le
  && (!doc.disponible_le || String(doc.disponible_le).slice(0, 10) <= aujourdhui)

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

export default { modeNotifications, aNotifierMaintenant, listeDestinataires }
