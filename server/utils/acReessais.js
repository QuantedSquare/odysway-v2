// Appels à ActiveCampaign : délai maximal et nouvelles tentatives.
//
// Constat du Docteur d'Ulysse (deal 16198, 21/09/2026) : l'ouverture d'un
// checkout a échoué sur un 503 d'AC, et les appels n'avaient aucun délai
// maximal (axios `timeout: 0`) — une réponse qui ne vient pas bloquait la
// fonction jusqu'à sa limite.
//
// Règles :
//   - 429 (limite de 5 requêtes/s) : la requête n'a pas été traitée, on la
//     rejoue quelle que soit la méthode ;
//   - 502, 503, 504, délai dépassé, connexion coupée : on ne rejoue que GET et
//     PUT, idempotents. Un POST (note, deal, contact) a pu être traité : le
//     rejouer créerait un doublon.
//
// PUR, hors l'appel lui-même (tests/unit/acReessais.test.mjs).

const DELAI_AC_MS = 15000
const RECUPERABLES = new Set([502, 503, 504])
const RESEAU = new Set(['ECONNABORTED', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'])

/** Combien de fois rejouer après cette erreur, pour cette méthode. 0 : jamais. */
const reessaisPermis = (methode, erreur) => {
  const statut = erreur?.response?.status
  if (statut === 429) return 3
  const idempotente = ['get', 'put'].includes(String(methode).toLowerCase())
  if (!idempotente) return 0
  if (statut && RECUPERABLES.has(statut)) return 2
  if (!erreur?.response && RESEAU.has(erreur?.code)) return 2
  return 0
}

/** Attente avant l'essai n° `essai` (0 = premier nouvel essai). Plus longue après un 429. */
const attente = (essai, erreur) => (erreur?.response?.status === 429 ? 1200 : 400) * 2 ** essai

/**
 * Exécute `appel` et le rejoue selon les règles ci-dessus.
 * @param {() => Promise<any>} appel
 * @param {string} methode
 * @param {(ms: number) => Promise<void>} [pause]
 */
const avecReessais = async (appel, methode, pause = ms => new Promise(r => setTimeout(r, ms))) => {
  for (let essai = 0; ; essai++) {
    try {
      return await appel()
    }
    catch (erreur) {
      if (essai >= reessaisPermis(methode, erreur)) throw erreur
      await pause(attente(essai, erreur))
    }
  }
}

export default { DELAI_AC_MS, reessaisPermis, attente, avecReessais }
