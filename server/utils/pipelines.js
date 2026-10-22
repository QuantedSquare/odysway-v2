// Pipelines et étapes AC que le code pose lui-même.
//
// AC range un deal dans la pipeline de son étape : poser l'étape d'une autre
// pipeline le déplace. D'où ces règles, qui décident l'étape d'après la
// pipeline où le deal se trouve déjà.
//
// Pipeline 7 « Partenaires » : les inscrits des voyages en portage (séjour d'un
// accompagnateur externe porté par Odysway). Ils ne suivent ni les relances ni
// les automations des prospects Odysway, et restent en 7 après paiement : leur
// CA est suivi à part dans Ulysse.

const PIPELINE = {
  prospects: '1',
  voyageurs: '2',
  departs: '4',
  portage: '7',
}

const ETAPE = {
  // Prospects
  prospectPaiementNonAcheve: '17',
  dev: '80',
  // Voyageurs
  voyageurEnCours: '6',
  voyageurSolde: '33',
  // Portage
  portageInscription: '87',
  portagePaiementNonAcheve: '88',
  portageAcompte: '84',
  portageSolde: '85',
}

/**
 * Pipeline et étape d'un deal créé par le tunnel pour un voyage en portage.
 * `null` : rien à changer (voyage Odysway, ou deal de test qui garde l'étape DEV).
 */
const creationPortage = (etapeDemandee, portage) => {
  if (!portage || String(etapeDemandee) === ETAPE.dev) return null
  return { group: PIPELINE.portage, stage: ETAPE.portageInscription }
}

/**
 * Pipeline et étape après un paiement. Un deal en portage reste en 7 ; tout
 * autre deal passe en Voyageurs (2), comme avant.
 */
const apresPaiement = (pipelineActuelle, resteAPayer) => {
  const solde = !(+resteAPayer > 0)
  if (String(pipelineActuelle) === PIPELINE.portage) {
    return { group: PIPELINE.portage, stage: solde ? ETAPE.portageSolde : ETAPE.portageAcompte }
  }
  return { group: PIPELINE.voyageurs, stage: solde ? ETAPE.voyageurSolde : ETAPE.voyageurEnCours }
}

/**
 * Étape « paiement CB non achevé » de la pipeline du deal, posée à l'ouverture
 * du paiement Stripe. `null` pour un voyageur (2) : il a déjà payé, l'étape 17
 * des prospects le renverrait en 1 (CYC-01 du Docteur d'Ulysse).
 */
const etapePaiementNonAcheve = (pipelineActuelle) => {
  if (String(pipelineActuelle) === PIPELINE.prospects) return ETAPE.prospectPaiementNonAcheve
  if (String(pipelineActuelle) === PIPELINE.portage) return ETAPE.portagePaiementNonAcheve
  return null
}

export default { PIPELINE, ETAPE, creationPortage, apresPaiement, etapePaiementNonAcheve }
