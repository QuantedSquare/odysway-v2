// Règles de l'Espace Voyageur (/mon-espace), sans accès réseau.
//
// PUR : aucun import automatique de Nitro, testé par
// tests/unit/espaceVoyageur.test.mjs (`npm run test:unit`).

// Le solde est dû 60 jours avant le départ (maquette validée : « soit 60 jours
// avant le départ »). Aucune règle n'existait dans le code avant l'espace.
const ECHEANCE_SOLDE_JOURS = 60

const CHAMPS_VOYAGEURS = Array.from({ length: 15 }, (_, i) => `traveler${i + 1}`)

const vide = v => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

const normaliserEmail = v => (vide(v) ? null : String(v).trim().toLowerCase())

// Validation volontairement simple : Supabase Auth et Brevo refusent le reste.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailValide = v => !vide(v) && EMAIL.test(String(v).trim())

// Motif `ilike` qui ne correspond qu'à CET email : `_` et `%` sont des jokers.
// Sans échappement, un compte `prenom_nom@x.fr` retrouverait les dossiers de
// `prenom.nom@x.fr`.
const motifEmailExact = email => String(email).trim().replace(/[\\%_]/g, c => `\\${c}`)

const sansAccents = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
const cleNom = s => sansAccents(s).toLowerCase().replace(/[^a-z]/g, '')

const DATE_FR = /^(\d{2})\/(\d{2})\/(\d{4})$/
const DATE_ISO = /^(\d{4})-(\d{2})-(\d{2})$/

// Une date de naissance invraisemblable devient null plutôt qu'une erreur
// d'insertion : la ligne du voyageur doit exister même mal saisie.
const dateNaissance = (s) => {
  let a, m, j
  const fr = DATE_FR.exec(s)
  const iso = DATE_ISO.exec(s)
  if (fr) [, j, m, a] = fr
  else if (iso) [, a, m, j] = iso
  else return null
  const d = new Date(Date.UTC(+a, +m - 1, +j))
  if (d.getUTCFullYear() !== +a || d.getUTCMonth() !== +m - 1 || d.getUTCDate() !== +j) return null
  return `${a}-${m}-${j}`
}

/**
 * Champ AC « Voyageur N » → identité. Format écrit par le tunnel :
 * "Prénom_Nom_JJ/MM/AAAA_ISO" ; le nom peut contenir des espaces, l'ISO peut
 * manquer, et les saisies à la main dans AC n'ont pas toujours de date.
 */
const lireVoyageur = (raw) => {
  if (vide(raw)) return null
  const parts = String(raw).split('_').map(p => p.trim())
  const iDate = parts.findIndex(p => DATE_FR.test(p) || DATE_ISO.test(p))
  const noms = (iDate === -1 ? parts : parts.slice(0, iDate)).filter(Boolean)
  const apres = iDate === -1 ? [] : parts.slice(iDate + 1).filter(Boolean)
  const iso = apres.length && /^[A-Za-z]{2,3}$/.test(apres[0]) ? apres[0].toUpperCase() : null
  return {
    firstname: noms[0] || null,
    lastname: noms.slice(1).join(' ') || null,
    birthdate: iDate === -1 ? null : dateNaissance(parts[iDate]),
    iso,
  }
}

/** Les voyageurs nommés d'un deal (champs mappés par getDealCustomFields), par numéro. */
const voyageursDuDeal = deal => CHAMPS_VOYAGEURS
  .map((k, i) => ({ slot: i + 1, raw: vide(deal?.[k]) ? null : String(deal[k]).trim() }))
  .filter(v => v.raw)
  .map(v => ({ ...v, ...lireVoyageur(v.raw) }))

/** Le voyageur qui porte le nom du contact du deal (le payeur), ou null. */
const slotTitulaire = (voyageurs, contact) => {
  const prenom = cleNom(contact?.firstname)
  const nom = cleNom(contact?.lastname)
  if (!prenom || !nom) return null
  const trouve = voyageurs.find(v => cleNom(v.firstname) === prenom && cleNom(v.lastname) === nom)
  return trouve ? trouve.slot : null
}

/** "Camille R." — seul nom montré aux autres voyageurs du départ. */
const nomPublic = (firstname, lastname) => {
  const p = String(firstname || '').trim()
  if (!p) return null
  const initiale = sansAccents(String(lastname || '').trim()).charAt(0).toUpperCase()
  return initiale ? `${p} ${initiale}.` : p
}

// Le jour calendaire à Paris : un départ « aujourd'hui » ne doit pas basculer
// à 22 h UTC la veille.
const aujourdhuiParis = (maintenant = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(maintenant)

const jour = v => (v ? String(v).slice(0, 10) : null)

const ecartJours = (de, a) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86400000)

/** 'a_venir' | 'en_cours' | 'passe' | 'sans_date', `aujourdhui` au format 'YYYY-MM-DD'. */
const etatVoyage = ({ departureDate, returnDate, aujourdhui }) => {
  const depart = jour(departureDate)
  if (!depart) return 'sans_date'
  const retour = jour(returnDate) || depart
  if (aujourdhui < depart) return 'a_venir'
  if (aujourdhui <= retour) return 'en_cours'
  return 'passe'
}

const ajouterJours = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/**
 * Ce qui reste à payer et pour quand. Montants en EUROS (le miroir AC les
 * stocke ainsi). `statut` : 'solde' | 'a_regler' | 'en_retard' | 'inconnu'.
 */
const situationPaiement = ({ totalValue, totalPaid, restToPay, departureDate, aujourdhui }) => {
  const total = Number.isFinite(Number(totalValue)) && totalValue !== null ? Number(totalValue) : null
  const paye = Number.isFinite(Number(totalPaid)) && totalPaid !== null ? Number(totalPaid) : null
  let reste = Number.isFinite(Number(restToPay)) && restToPay !== null ? Number(restToPay) : null
  if (reste === null && total !== null && paye !== null) reste = Math.max(0, total - paye)
  const depart = jour(departureDate)
  const echeance = depart ? ajouterJours(depart, -ECHEANCE_SOLDE_JOURS) : null

  let statut = 'inconnu'
  if (reste !== null) {
    if (reste <= 0.009) statut = 'solde'
    else if (echeance && aujourdhui > echeance) statut = 'en_retard'
    else statut = 'a_regler'
  }
  return {
    total,
    paye,
    reste: reste === null ? null : Math.round(reste * 100) / 100,
    echeance,
    delaiJours: ECHEANCE_SOLDE_JOURS,
    joursAvantEcheance: echeance ? ecartJours(aujourdhui, echeance) : null,
    statut,
  }
}

/**
 * Ligne du journal d'encaissements d'Ulysse (`ulysse.encaissements`, montants
 * en euros) → ligne de l'historique, ou `null` si elle n'y a pas sa place :
 *   - archivée ;
 *   - saisie pas encore reportée dans AC (`ac_le` vide) : absente de « Déjà
 *     réglé », elle le contredirait ;
 *   - reprise à confirmer : l'écart relevé entre Total payé et Stripe + Alma,
 *     moyen et date inconnus — compté dans `horsListe`, jamais montré comme
 *     un paiement.
 * Le journal ne contient que l'argent passé hors de Stripe et d'Alma (une
 * reprise EST Total payé − Stripe − Alma) : aucun doublon possible avec eux.
 */
const ligneEncaissement = (e) => {
  if (!e || e.archived) return null
  const reporte = e.origine === 'saisie' && !!e.ac_le
  const confirmee = e.origine === 'reprise' && e.statut === 'confirme' && e.moyen !== 'inconnu'
  if (!reporte && !confirmee) return null
  return { le: e.recu_le || null, montant: Number(e.montant) || 0, rembourse: 0, moyen: e.moyen, statut: 'paye', via: 'Hors ligne' }
}

const arrondi = n => Math.round(n * 100) / 100

/**
 * Historique des paiements du titulaire : Stripe, Alma et journal hors ligne
 * d'Ulysse, payés ou en attente, par date. `horsListe` : ce que « Déjà réglé »
 * (Total payé d'AC, `paye`) compte au-delà des lignes reçues — la même égalité
 * que le Docteur d'Ulysse (ARG-04). `null` si une source manque ou s'il n'y a
 * rien d'autre.
 * @param {{ stripe: object, alma: object, journal: object }} sources chacune `{ disponible, paiements | lignes }`
 * @param {number|null} paye
 */
const historiquePaiements = ({ stripe, alma, journal }, paye) => {
  const lignes = [
    ...(stripe?.paiements || []).map(p => ({ ...p, via: 'Stripe' })),
    ...(alma?.paiements || []).map(p => ({ ...p, via: 'Alma' })),
  ]
    .filter(p => p.statut === 'paye' || p.statut === 'en_attente')
    .map(p => ({ le: p.le, montant: p.montant, rembourse: p.rembourse || 0, moyen: p.moyen || null, statut: p.statut, via: p.via }))
  lignes.push(...(journal?.lignes || []).map(ligneEncaissement).filter(Boolean))
  lignes.sort((a, b) => String(a.le).localeCompare(String(b.le)))

  const complet = !!(stripe?.disponible && alma?.disponible && journal?.disponible)
  const recu = lignes.filter(p => p.statut === 'paye').reduce((t, p) => t + p.montant - p.rembourse, 0)
  const ecart = complet && paye !== null && paye !== undefined ? arrondi(Number(paye) - recu) : 0
  return { complet, paiements: lignes, horsListe: ecart > 0.009 ? ecart : null }
}

const STATUTS_EXCLUS = ['Perdu', 'Supprimé']

/**
 * Un deal du miroir doit-il apparaître dans l'espace ? Pipeline 2 (voyageurs)
 * toujours ; pipeline 1 (prospects) seulement avec une réservation active —
 * une option posée ou un acompte en cours. Jamais la corbeille (3) ni les
 * dossiers de départ (4), qui ne sont pas des réservations de client.
 */
const dealVisible = (deal, { aUneReservation = false } = {}) => {
  if (!deal || deal.deleted) return false
  if (STATUTS_EXCLUS.includes(deal.status)) return false
  if (Number(deal.pipeline_id) === 2) return true
  if (Number(deal.pipeline_id) === 1) return aUneReservation
  return false
}

// « Trek au pays des Sherpas - Camille Rousseau » : le titre AC colle le nom du
// contact au voyage. On ne garde que le voyage ; Sanity donnera le vrai titre.
const titreVoyage = (titre, contact) => {
  const t = String(titre || '').trim()
  if (!t) return null
  const nom = [contact?.firstname, contact?.lastname].filter(Boolean).join(' ').trim()
  if (nom && t.toLowerCase().endsWith(nom.toLowerCase())) {
    return t.slice(0, t.length - nom.length).replace(/[\s\-–—|:]+$/, '').trim() || t
  }
  return t
}

/**
 * Ce que le navigateur reçoit d'un dossier. Un voyageur invité ne reçoit
 * AUCUN montant : `paiement` n'est construit que pour le titulaire.
 * @param {{ deal: object, role: string, reservation: object|null, date: object|null }} dossier
 * @param {string} aujourdhui 'YYYY-MM-DD'
 * @param {{ contact?: object }} [p]
 */
const resumeDossier = ({ deal, role, reservation, date }, aujourdhui, { contact } = {}) => {
  const departureDate = jour(date?.departure_date) || jour(deal.departure_date)
  const returnDate = jour(date?.return_date) || jour(deal.return_date)
  const etat = etatVoyage({ departureDate, returnDate, aujourdhui })
  const titulaire = role === 'titulaire'
  return {
    id: Number(deal.id),
    role,
    slug: date?.travel_slug || deal.slug || null,
    titre: titreVoyage(deal.title, contact),
    pays: deal.country || null,
    depart: departureDate,
    retour: returnDate,
    duree: departureDate && returnDate ? ecartJours(departureDate, returnDate) + 1 : null,
    joursAvantDepart: departureDate && etat === 'a_venir' ? ecartJours(aujourdhui, departureDate) : null,
    etat,
    nbVoyageurs: Number(deal.nb_traveler) || Number(reservation?.booked_places) || null,
    groupe: date ? !date.is_indiv_travel && !date.is_custom_travel : null,
    conseiller: deal.seller || null,
    option: titulaire && reservation?.is_option ? { expire: reservation.expiracy_date || null } : null,
    paiement: titulaire
      ? situationPaiement({
          totalValue: deal.total_value,
          totalPaid: deal.total_paid,
          restToPay: deal.rest_to_pay,
          departureDate,
          aujourdhui,
        })
      : null,
  }
}

export default {
  ECHEANCE_SOLDE_JOURS,
  aujourdhuiParis,
  titreVoyage,
  resumeDossier,
  CHAMPS_VOYAGEURS,
  normaliserEmail,
  emailValide,
  motifEmailExact,
  lireVoyageur,
  voyageursDuDeal,
  slotTitulaire,
  nomPublic,
  etatVoyage,
  situationPaiement,
  ligneEncaissement,
  historiquePaiements,
  dealVisible,
  ecartJours,
}
