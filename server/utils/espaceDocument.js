// Règles des documents de voyage de l'Espace Voyageur (déposés par l'équipe
// dans Ulysse, lus par les clients).
//
// PUR (tests/unit/espaceDocument.test.mjs).

const TYPES = [
  { valeur: 'fiche_voyage', libelle: 'Fiche voyage', reserveTitulaire: false },
  { valeur: 'carnet', libelle: 'Carnet de séjour', reserveTitulaire: false },
  { valeur: 'billet', libelle: 'Billets', reserveTitulaire: false },
  { valeur: 'assurance', libelle: 'Contrat d\'assurance', reserveTitulaire: false },
  // Une facture porte des montants : jamais montrée à un voyageur invité.
  { valeur: 'facture', libelle: 'Facture', reserveTitulaire: true },
  { valeur: 'autre', libelle: 'Document', reserveTitulaire: false },
]
const VALEURS_TYPES = TYPES.map(t => t.valeur)
const MIMES = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }
const TAILLE_MAX = 20 * 1024 * 1024

const libelleType = v => TYPES.find(t => t.valeur === v)?.libelle || 'Document'

const jour = v => (v ? String(v).slice(0, 10) : null)

/**
 * Ce que le client voit d'un document : rien s'il n'est pas publié ou s'il est
 * supprimé ; « Bientôt » avant sa date de disponibilité ; sinon disponible.
 * @returns {'disponible'|'bientot'|null}
 */
const etatDocument = (doc, aujourdhui) => {
  if (!doc || doc.deleted_at || !doc.publie) return null
  const dispo = jour(doc.disponible_le)
  return dispo && aujourdhui < dispo ? 'bientot' : 'disponible'
}

/** Un invité ne voit pas les documents réservés au titulaire. */
const visiblePour = (doc, role) => !doc.reserve_titulaire || role === 'titulaire'

/** Vue navigateur : jamais le chemin de stockage. */
const vueClient = (doc, { aujourdhui, vu = false } = {}) => {
  const etat = etatDocument(doc, aujourdhui)
  return {
    id: doc.id,
    type: doc.type,
    libelleType: libelleType(doc.type),
    titre: doc.titre,
    description: doc.description || null,
    taille: doc.taille,
    format: (MIMES[doc.mime_type] || 'fichier').toUpperCase(),
    etat,
    disponibleLe: jour(doc.disponible_le),
    publieLe: doc.publie_le || null,
    // « Nouveau » : disponible et jamais ouvert par ce compte.
    nouveau: etat === 'disponible' && !vu,
  }
}

/** Nom proposé au téléchargement : le titre, sans caractère gênant, avec la bonne extension. */
const nomTelechargement = (doc) => {
  const base = String(doc.titre || 'document')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 80) || 'document'
  return `${base}.${MIMES[doc.mime_type] || 'pdf'}`
}

/** Tri : disponibles d'abord (les plus récents en tête), puis « Bientôt » par date. */
const trier = (a, b) => {
  if (a.etat !== b.etat) return a.etat === 'disponible' ? -1 : 1
  if (a.etat === 'bientot') return String(a.disponibleLe).localeCompare(String(b.disponibleLe))
  return String(b.publieLe || '').localeCompare(String(a.publieLe || ''))
}

export default { TYPES, VALEURS_TYPES, MIMES, TAILLE_MAX, libelleType, etatDocument, visiblePour, vueClient, nomTelechargement, trier }
