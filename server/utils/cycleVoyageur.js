// Étape d'un deal voyageur (pipeline 2) selon les dates de son voyage.
//
// Cycle de vie imposé par Alex (22/09/2026) : départ → « Voyage en cours »,
// retour → « Retour Client ». Le cron quotidien des départs le tenait pour les
// dossiers de départ (pipeline 4) seulement ; les voyageurs restaient « En
// attente de départ » après leur retour (37 au 24/09/2026, CYC-04 et CYC-05 du
// Docteur).
//
// Prudence : seul un voyageur SOLDÉ (« En attente de départ ») ou déjà « Voyage
// en cours » avance. Un solde encore dû (étapes 6, 31, 7) reste visible tel
// quel : c'est au commercial de le régler, le Docteur le signale. Le passage à
// « Gagné » attend la décision d'Odysway (ONHOLD-906).
//
// PUR (tests/unit/cycleVoyageur.test.mjs).

const ETAPES_P2 = {
  EN_ATTENTE_DEPART: '33',
  VOYAGE_EN_COURS: '16',
  RETOUR_CLIENT: '11',
}

const jour = v => (v ? String(v).slice(0, 10) : null)

/**
 * L'étape vers laquelle avancer ce voyageur aujourd'hui, ou `null` pour ne rien faire.
 * @param {{ stage: string, departureDate: string|null, returnDate: string|null, aujourdhui: string }} p aujourdhui : 'YYYY-MM-DD'
 */
const etapeVoyageurAttendue = ({ stage, departureDate, returnDate, aujourdhui }) => {
  const depart = jour(departureDate)
  const retour = jour(returnDate)
  const actuelle = String(stage)
  if (!depart || !retour || retour < depart) return null
  if (![ETAPES_P2.EN_ATTENTE_DEPART, ETAPES_P2.VOYAGE_EN_COURS].includes(actuelle)) return null
  const attendue = aujourdhui > retour
    ? ETAPES_P2.RETOUR_CLIENT
    : aujourdhui >= depart ? ETAPES_P2.VOYAGE_EN_COURS : null
  return attendue && attendue !== actuelle ? attendue : null
}

export default { ETAPES_P2, etapeVoyageurAttendue }
