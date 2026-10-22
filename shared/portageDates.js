// Dates d'un séjour en portage, vues de l'Espace porteur (/espace-porteur) :
// les dates que le porteur propose, et le remplissage des départs qu'Odysway a
// ouverts. La date elle-même reste à Odysway (prix, capacité, publication) :
// le porteur propose, Odysway accepte dans Ulysse.
//
// PUR et partagé (serveur + navigateur, tests/unit/portageDates.test.mjs).

const JOUR = /^\d{4}-\d{2}-\d{2}$/
const DUREE_MAX_JOURS = 60
const PARTICIPANTS_MAX = 200
const PRIX_MAX_EUROS = 100000
const NOTE_MAX = 1000

// Étapes de la pipeline 7 après un paiement (server/utils/pipelines.js).
const ETAPES_PAYEES = ['84', '85', '86']

const jourValide = (v) => {
  if (typeof v !== 'string' || !JOUR.test(v)) return false
  const d = new Date(`${v}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
}

const ecartJours = (de, a) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 864e5)

const entier = (v, { min, max }) => {
  if (v === null || v === undefined || v === '') return { ok: true, valeur: null }
  const n = Number(v)
  if (!Number.isInteger(n) || n < min || n > max) return { ok: false }
  return { ok: true, valeur: n }
}

/**
 * Proposition saisie par le porteur → `{ valeur, erreurs }`. `valeur` est la
 * ligne à écrire (prix en centimes), `erreurs` les messages à lui montrer.
 * `aujourdhui` : AAAA-MM-JJ.
 */
const nettoyerProposition = (brut, { aujourdhui }) => {
  const p = brut && typeof brut === 'object' ? brut : {}
  const erreurs = []

  const depart = jourValide(p.depart) ? p.depart : null
  const retour = jourValide(p.retour) ? p.retour : null
  if (!depart) erreurs.push('la date de départ')
  else if (depart <= aujourdhui) erreurs.push('une date de départ à venir')
  if (!retour) erreurs.push('la date de retour')
  else if (depart && retour < depart) erreurs.push('un retour après le départ')
  else if (depart && ecartJours(depart, retour) > DUREE_MAX_JOURS) erreurs.push(`un séjour de ${DUREE_MAX_JOURS} jours au plus`)

  const min = entier(p.participantsMin, { min: 1, max: PARTICIPANTS_MAX })
  const max = entier(p.participantsMax, { min: 1, max: PARTICIPANTS_MAX })
  if (!min.ok) erreurs.push('un minimum de participants entre 1 et 200')
  if (!max.ok) erreurs.push('un maximum de participants entre 1 et 200')
  if (min.ok && max.ok && min.valeur !== null && max.valeur !== null && min.valeur > max.valeur) {
    erreurs.push('un minimum inférieur au maximum')
  }

  const prix = entier(p.prixSouhaite, { min: 1, max: PRIX_MAX_EUROS })
  if (!prix.ok) erreurs.push('un prix souhaité en euros, sans centimes')

  const note = typeof p.note === 'string' ? p.note.replace(/\r\n?/g, '\n').trim().slice(0, NOTE_MAX) : ''

  return {
    erreurs,
    valeur: erreurs.length
      ? null
      : {
          depart,
          retour,
          participants_min: min.valeur,
          participants_max: max.valeur,
          prix_souhaite: prix.valeur === null ? null : prix.valeur * 100,
          note: note || null,
        },
  }
}

/**
 * Remplissage d'un départ, sans rien de personnel : des comptes.
 *
 * `date` : la ligne `travel_dates`. `reservations` : ses `booked_dates`
 * actives, chacune avec le deal du miroir (`deal`: pipeline_id, stage_id,
 * total_paid, status) quand il est connu. `closingDays` : les inscriptions
 * ferment ce nombre de jours avant le départ (Sanity, 30 par défaut).
 */
const remplissage = ({ date, reservations = [], aujourdhui, closingDays = 30 }) => {
  let dossiersPayes = 0
  let placesPayees = 0
  let enCours = 0
  let options = 0
  let placesOptions = 0

  for (const r of reservations) {
    const d = r.deal
    if (d && (String(d.pipeline_id) === '3' || d.status === 'Supprimé' || d.status === 'Perdu')) continue
    const places = Number(r.booked_places) || 0
    const paye = Number(d?.total_paid) > 0 || ETAPES_PAYEES.includes(String(d?.stage_id)) || String(d?.pipeline_id) === '2'
    if (paye) {
      dossiersPayes++
      placesPayees += places
    }
    else if (r.is_option) {
      options++
      placesOptions += places
    }
    else {
      enCours++
    }
  }

  const min = Number(date.min_travelers) || null
  const max = Number(date.max_travelers) || null
  const reservees = Number(date.booked_seat) || 0
  const depart = String(date.departure_date).slice(0, 10)
  const retour = date.return_date ? String(date.return_date).slice(0, 10) : null
  const fermeture = new Date(Date.parse(`${depart}T00:00:00Z`) - closingDays * 864e5).toISOString().slice(0, 10)

  let statut = 'ouverte'
  if (depart < aujourdhui) statut = 'passee'
  else if (!date.published) statut = 'en_preparation'
  else if (max && reservees >= max) statut = 'complete'
  else if (aujourdhui > fermeture) statut = 'fermee'

  return {
    id: date.id,
    depart,
    retour,
    statut,
    min,
    max,
    placesReservees: reservees,
    placesPayees,
    dossiersPayes,
    enCours,
    options,
    placesOptions,
    garanti: Boolean(min) && placesPayees >= min,
    fermeture,
  }
}

const STATUTS_DEPART = {
  ouverte: 'Ouverte aux inscriptions',
  en_preparation: 'En préparation chez Odysway',
  complete: 'Complète',
  fermee: 'Inscriptions closes',
  passee: 'Passée',
}

const STATUTS_PROPOSITION = {
  proposee: 'En attente de réponse',
  acceptee: 'Acceptée',
  refusee: 'Non retenue',
  retiree: 'Retirée',
}

export default {
  DUREE_MAX_JOURS,
  ETAPES_PAYEES,
  STATUTS_DEPART,
  STATUTS_PROPOSITION,
  jourValide,
  nettoyerProposition,
  remplissage,
}
